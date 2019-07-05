const Boom = require('@hapi/boom');
const Crumb = require('@hapi/crumb');
const hapiAuthCookie = require('@hapi/cookie');
const Good = require('@hapi/good');
const Hapi = require('@hapi/hapi');
const Joi = require('@hapi/joi');
const Scooter = require('@hapi/scooter');
const Blankie = require('blankie');
const rp = require('request-promise-native');
const uuid = require('uuid/v4');

const config = require('./lib/config');
const OpenIDClient = require('./lib/auth/OpenIDClient');
const CentrelineDAO = require('./lib/db/CentrelineDAO');
const CountDAO = require('./lib/db/CountDAO');
const CountDataDAO = require('./lib/db/CountDataDAO');
const StudyDAO = require('./lib/db/StudyDAO');
const StudyRequestDAO = require('./lib/db/StudyRequestDAO');
const StudyRequestReasonDAO = require('./lib/db/StudyRequestReasonDAO');
const StudyRequestStatusDAO = require('./lib/db/StudyRequestStatusDAO');
const UserDAO = require('./lib/db/UserDAO');
const db = require('./lib/db/db');
const StudyRequest = require('./lib/model/StudyRequest');
const vueConfig = require('./vue.config');

const CentrelineType = {
  SEGMENT: 1,
  INTERSECTION: 2,
};

const Format = {
  GEOJSON: 'geojson',
  JSON: 'json',
};

const LogTag = {
  DEBUG: 'debug',
  ERROR: 'error',
  INFO: 'info',
  INIT: 'init',
};

async function failAction(request, h, err) {
  if (config.ENV === 'production') {
    request.log(LogTag.ERROR, `ValidationError: ${err.message}`);
    throw Boom.badRequest('Invalid request payload input');
  } else {
    request.log(LogTag.ERROR, err);
    throw err;
  }
}

const options = {
  app: { config },
  debug: {
    request: ['error'],
  },
  host: config.host,
  port: config.port,
  routes: {
    response: {
      failAction,
    },
    security: {
      hsts: {
        maxAge: 2592000,
        includeSubdomains: true,
        preload: false,
      },
      xframe: true,
      xss: true,
      noOpen: true,
      noSniff: true,
      referrer: false,
    },
    validate: {
      failAction,
    },
  },
};
if (config.ENV === 'development') {
  const tls = config.https;
  Object.assign(options, { tls });
}
const server = Hapi.server(options);

async function initServer() {
  // LOGGING
  await server.register({
    plugin: Good,
    options: {
      reporters: {
        console: [
          {
            module: '@hapi/good-squeeze',
            name: 'Squeeze',
            args: [{
              error: '*',
              log: '*',
              response: '*',
            }],
          },
          {
            module: '@hapi/good-console',
          },
          'stdout',
        ],
      },
    },
  });
  server.events.on('route', (route) => {
    server.log(LogTag.INIT, `registered route: ${route.method.toUpperCase()} ${route.path}`);
  });

  // START
  server.log(LogTag.INIT, `starting MOVE web application server in ${config.ENV} mode...`);

  // PLUGINS
  server.log(LogTag.INIT, 'registering server plugins...');

  await server.register({
    plugin: hapiAuthCookie,
  });

  await server.register([Scooter, {
    plugin: Blankie,
    options: {},
  }]);

  await server.register({
    plugin: Crumb,
    options: {
      cookieOptions: {
        isHttpOnly: true,
        isSameSite: 'Lax',
        isSecure: true,
        path: vueConfig.publicPath,
        ...config.session,
      },
      key: 'csrf',
      restful: true,
    },
  });

  // SESSION CACHE
  server.log(LogTag.INIT, 'configuring session cache...');
  const cache = server.cache({
    segment: 'sessions',
    expiresIn: 3 * 24 * 60 * 60 * 1000,
  });
  server.app.cache = cache;

  // AUTH STRATEGY
  server.log(LogTag.INIT, 'configuring auth strategy...');
  server.auth.strategy('session', 'cookie', {
    cookie: {
      clearInvalid: true,
      isHttpOnly: true,
      isSameSite: 'Lax',
      isSecure: true,
      name: 'session',
      path: vueConfig.publicPath,
      ttl: 24 * 60 * 60 * 1000,
      ...config.session,
    },
    validateFunc: async (request, session) => {
      const { sessionId } = session;
      const cached = await cache.get(sessionId);
      const out = {
        valid: !!cached,
      };
      if (out.valid) {
        out.credentials = cached.user;
      }
      return out;
    },
  });
  server.auth.default('session');

  // ROUTES
  server.log(LogTag.INIT, 'registering routes...');

  // WEB INIT

  /**
   * GET /web/init
   *
   * Provides all data required to initialize the web application interface.
   * This should NOT return any user-specific data.
   */
  server.route({
    method: 'GET',
    path: '/web/init',
    options: {
      auth: { mode: 'try' },
    },
    handler: async () => {
      let [reasons, statii] = await Promise.all([
        StudyRequestReasonDAO.all(),
        StudyRequestStatusDAO.all(),
      ]);
      reasons = Array.from(reasons.values());
      statii = Array.from(statii.values());
      return {
        reasons,
        statii,
      };
    },
  });

  // AUTH

  function getRedirectUri() {
    if (config.ENV === 'production') {
      return 'https://move.intra.dev-toronto.ca/flashcrow/api/auth/openid-connect-callback';
    }
    return 'https://lvh.me:8080/flashcrow/api/auth/openid-connect-callback';
  }

  /**
   * GET /auth/openid-connect
   *
   * Initiates the OpenID Connect OAuth handshake by redirecting the user to the
   * authorization URL.
   */
  server.route({
    method: 'GET',
    path: '/auth/openid-connect',
    options: {
      auth: false,
    },
    handler: async (request, h) => {
      const client = await OpenIDClient.get();
      const authorizationUrl = client.authorizationUrl({
        redirect_uri: getRedirectUri(),
        scope: 'openid email',
      });
      request.log(LogTag.DEBUG, `redirecting to: ${authorizationUrl}`);
      return h.redirect(authorizationUrl);
    },
  });

  /**
   * GET /auth/openid-connect-callback
   *
   * OpenID Connect callback URL.
   */
  server.route({
    method: 'GET',
    path: '/auth/openid-connect-callback',
    options: {
      auth: false,
    },
    handler: async (request, h) => {
      request.log(LogTag.DEBUG, request.query);

      // retrieve token set from OpenID Connect provider
      const client = await OpenIDClient.get();
      const tokenSet = await client.authorizationCallback(
        getRedirectUri(),
        request.query,
      );
      request.log(LogTag.DEBUG, `received and validated tokens ${JSON.stringify(tokenSet)}`);
      request.log(LogTag.DEBUG, `validated id_token claims ${JSON.stringify(tokenSet.claims)}`);

      // upgrade to application session ID
      const { sub, email } = tokenSet.claims;
      const token = tokenSet.id_token;
      let user = await UserDAO.bySubject(sub);
      if (user === null) {
        // TODO: get name as well (e.g. from email address?)
        user = {
          subject: sub, email, name: '', token,
        };
        await UserDAO.create(user);
      } else {
        Object.assign(user, { email, token });
        await UserDAO.update(user);
      }
      const sessionId = uuid();
      await request.server.app.cache.set(sessionId, { user }, 0);
      request.cookieAuth.set({ sessionId });

      // redirect to home
      return h.redirect(config.PUBLIC_PATH);
    },
  });

  server.route({
    method: 'POST',
    path: '/auth/stub',
    options: {
      auth: false,
      plugins: {
        crumb: {
          restful: false,
        },
      },
      validate: {
        payload: {
          email: Joi.string().email().required(),
          name: Joi.string().required(),
        },
      },
    },
    handler: async (request, h) => {
      const { email, name } = request.payload;
      // upgrade to application session ID
      let user = await UserDAO.byEmail(email);
      if (user === null) {
        user = {
          subject: uuid(),
          email,
          name,
          token: '',
        };
        await UserDAO.create(user);
      }
      const sessionId = uuid();
      await request.server.app.cache.set(sessionId, { user }, 0);
      request.cookieAuth.set({ sessionId });

      // redirect to home
      return h.redirect(config.PUBLIC_PATH);
    },
  });

  server.route({
    method: 'GET',
    path: '/auth',
    options: {
      auth: { mode: 'try' },
    },
    handler: async (request, h) => {
      const csrf = server.plugins.crumb.generate(request, h);
      const out = {
        csrf,
        loggedIn: request.auth.isAuthenticated,
        user: null,
      };
      if (out.loggedIn) {
        const { email, name } = request.auth.credentials;
        out.user = { email, name };
      }
      return out;
    },
  });

  /**
   * POST /auth/test-login
   *
   * Bypasses the OpenID Connect flow in testing, allowing us to run REST
   * API tests.
   */
  server.route({
    method: 'POST',
    path: '/auth/test-login',
    options: {
      auth: false,
    },
    handler: async (request) => {
      if (config.ENV === 'production') {
        throw new Error('nope.');
      }

      // "authenticate" test user
      const sub = '0123456789';
      const email = 'flashcrow.tester@gmail.com';
      const name = 'Flashcrow Tester';
      const token = 'HEADER.PAYLOAD.SIGNATURE';
      let user = await UserDAO.bySubject(sub);
      if (user === null) {
        user = {
          subject: sub,
          email,
          name,
          token,
        };
        await UserDAO.create(user);
      } else {
        Object.assign(user, { email, name, token });
        await UserDAO.update(user);
      }
      const sessionId = uuid();
      await request.server.app.cache.set(sessionId, { user }, 0);
      request.cookieAuth.set({ sessionId });
    },
  });

  /**
   * POST /auth/logout
   *
   * Logs the currently authenticated user out.
   */
  server.route({
    method: 'POST',
    path: '/auth/logout',
    options: {
      handler: async (request, h) => {
        // clear session
        const { sessionId } = request.state.session;
        request.server.app.cache.drop(sessionId);
        request.cookieAuth.clear();

        // redirect home
        return h.redirect(config.PUBLIC_PATH);
      },
    },
  });

  // LOCATION QUERYING

  server.route({
    method: 'GET',
    path: '/cotgeocoder/suggest',
    options: {
      auth: { mode: 'try' },
    },
    handler: async (request) => {
      const searchString = request.query.q;
      const uri = 'https://map.toronto.ca/cotgeocoder/rest/geocoder/suggest';
      const qs = { searchString, f: 'json' };
      const response = await rp({
        json: true,
        uri,
        qs,
        rejectUnauthorized: false,
      });
      if (response.result && response.result.rows) {
        return response.result.rows;
      }
      return [];
    },
  });

  server.route({
    method: 'GET',
    path: '/cotgeocoder/findAddressCandidates',
    options: {
      auth: { mode: 'try' },
    },
    handler: async (request) => {
      const { keyString } = request.query;
      const uri = 'https://map.toronto.ca/cotgeocoder/rest/geocoder/findAddressCandidates';
      const qs = { keyString, f: 'json' };
      const response = await rp({
        json: true,
        uri,
        qs,
        rejectUnauthorized: false,
      });
      if (response.result && response.result.rows && response.result.rows.length > 0) {
        const {
          INT_GEO_ID,
          KEY_DESC,
          LATITUDE,
          LONGITUDE,
        } = response.result.rows[0];
        return {
          centrelineId: INT_GEO_ID,
          centrelineType: CentrelineType.INTERSECTION,
          description: KEY_DESC,
          lat: LATITUDE,
          lng: LONGITUDE,
        };
      }
      return Boom.notFound(`could not locate key string: ${keyString}`);
    },
  });

  server.route({
    method: 'GET',
    path: '/location/centreline',
    options: {
      auth: { mode: 'try' },
      validate: {
        query: {
          centrelineId: Joi.number().integer().positive().required(),
          centrelineType: Joi.number().valid(
            CentrelineType.SEGMENT,
            CentrelineType.INTERSECTION,
          ).required(),
        },
      },
    },
    handler: async (request) => {
      const {
        centrelineId,
        centrelineType,
      } = request.query;
      const location = await CentrelineDAO.byIdAndType(centrelineId, centrelineType);
      if (location === null) {
        return Boom.notFound(`could not locate centreline ID ${centrelineId}`);
      }
      return location;
    },
  });

  // COUNT METADATA
  server.route({
    method: 'GET',
    path: '/counts/byBoundingBox',
    options: {
      auth: { mode: 'try' },
      validate: {
        query: {
          f: Joi.string().valid(
            Format.GEOJSON,
            Format.JSON,
          ).default(Format.JSON),
          xmin: Joi.number().min(-180).max(180).required(),
          ymin: Joi.number().min(-90).max(90).required(),
          xmax: Joi.number().min(-180).max(180).greater(Joi.ref('xmin'))
            .required(),
          ymax: Joi.number().min(-90).max(90).greater(Joi.ref('ymin'))
            .required(),
        },
      },
    },
    handler: async (request) => {
      const {
        f,
        xmin,
        ymin,
        xmax,
        ymax,
      } = request.query;
      const counts = await CountDAO.byBoundingBox(xmin, ymin, xmax, ymax);
      if (f === Format.JSON) {
        return counts;
      }
      // convert to GeoJSON FeatureCollection
      const features = counts.map((count) => {
        const { id } = count;
        const properties = Object.assign({}, count);
        delete properties.geom;
        return {
          type: 'Feature',
          geometry: count.geom,
          properties,
          id,
        };
      });
      return {
        type: 'FeatureCollection',
        features,
      };
    },
  });

  server.route({
    method: 'GET',
    path: '/counts/byCentreline',
    options: {
      auth: { mode: 'try' },
      validate: {
        query: {
          centrelineId: Joi.number().integer().positive().required(),
          centrelineType: Joi.number().valid(
            CentrelineType.SEGMENT,
            CentrelineType.INTERSECTION,
          ).required(),
          end: Joi.date().min(Joi.ref('start')).optional(),
          maxPerCategory: Joi
            .number()
            .integer()
            .positive()
            .max(100)
            .default(10),
          start: Joi.date().min('1-1-1985').optional(),
        },
      },
    },
    handler: async (request) => {
      const {
        centrelineId,
        centrelineType,
        end,
        maxPerCategory,
        start,
      } = request.query;
      let dateRange = null;
      if (start !== undefined && end !== undefined) {
        dateRange = { start, end };
      }
      const [counts, numPerCategory] = await Promise.all([
        CountDAO.byCentreline(
          centrelineId,
          centrelineType,
          dateRange,
          maxPerCategory,
        ),
        CountDAO.byCentrelineNumPerCategory(
          centrelineId,
          centrelineType,
          dateRange,
        ),
      ]);
      return { counts, numPerCategory };
    },
  });

  // COUNT DATA
  server.route({
    method: 'GET',
    path: '/counts/data',
    options: {
      auth: { mode: 'try' },
      validate: {
        query: {
          countInfoId: Joi.number().integer().positive().required(),
          categoryId: Joi.number().integer().positive().required(),
        },
      },
    },
    handler: async (request) => {
      const { countInfoId, categoryId } = request.query;
      const count = await CountDAO.byIdAndCategory(countInfoId, categoryId);
      if (count === null) {
        return Boom.notFound(
          `no count found with ID ${countInfoId} and category ${categoryId}`,
        );
      }
      return CountDataDAO.byCount(count);
    },
  });

  // REQUESTS: STUDY
  server.route({
    method: 'POST',
    path: '/requests/study',
    options: {
      response: {
        schema: StudyRequest.persisted,
      },
      validate: {
        payload: StudyRequest.transient,
      },
    },
    handler: async (request) => {
      const { subject } = request.auth.credentials;
      const studyRequest = await StudyRequestDAO.create({
        userSubject: subject,
        status: 'REQUESTED',
        ...request.payload,
      });
      const studyPromises = studyRequest.studies.map(study => StudyDAO.create({
        userSubject: subject,
        studyRequestId: studyRequest.id,
        ...study,
      }));
      studyRequest.studies = await Promise.all(studyPromises);
      return studyRequest;
    },
  });

  server.route({
    method: 'GET',
    path: '/requests/study',
    options: {
      response: {
        schema: Joi.array().items(StudyRequest.persisted),
      },
    },
    handler: async (request) => {
      // TODO: pagination
      // TODO: admin fetching for TSU
      const user = request.auth.credentials;
      return StudyRequestDAO.byUser(user);
    },
  });

  // START SERVER
  await server.start();
  server.log(LogTag.INIT, `Server started at: ${server.info.uri}...`);
}

initServer();

const shutdownEvents = ['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException', 'SIGTERM'];
function onShutdown() {
  db.$pool.end();
  server.stop();
}
shutdownEvents.forEach((event) => {
  process.on(event, onShutdown);
});
