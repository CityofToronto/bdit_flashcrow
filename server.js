const Blankie = require('blankie');
const Boom = require('boom');
const Hapi = require('hapi');
const hapiAuthCookie = require('hapi-auth-cookie');
const Joi = require('joi');
const rp = require('request-promise-native');
const Scooter = require('scooter');
const uuid = require('uuid/v4');

const config = require('./lib/config');
const OpenIDClient = require('./lib/auth/OpenIDClient');
const CentrelineDAO = require('./lib/db/CentrelineDAO');
const CountDAO = require('./lib/db/CountDAO');
const CountDataDAO = require('./lib/db/CountDataDAO');
const UserDAO = require('./lib/db/UserDAO');
const db = require('./lib/db/db');
const vueConfig = require('./vue.config');

const CentrelineType = {
  SEGMENT: 1,
  INTERSECTION: 2,
};

const Format = {
  GEOJSON: 'geojson',
  JSON: 'json',
};

const options = {
  app: { config },
  debug: {
    request: ['error'],
  },
  host: config.host,
  port: config.port,
  routes: {
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
  },
};
if (config.ENV === 'development') {
  const tls = config.https;
  Object.assign(options, { tls });
}
const server = Hapi.server(options);

async function initServer() {
  await server.register({
    plugin: hapiAuthCookie,
  });

  await server.register([Scooter, {
    plugin: Blankie,
    options: {},
  }]);

  const cache = server.cache({
    segment: 'sessions',
    expiresIn: 3 * 24 * 60 * 60 * 1000,
  });
  server.app.cache = cache;
  server.auth.strategy('session', 'cookie', {
    ...config.session,
    clearInvalid: true,
    cookie: 'session',
    isHttpOnly: true,
    isSameSite: 'Lax',
    isSecure: true,
    path: vueConfig.publicPath,
    ttl: 24 * 60 * 60 * 1000,
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
    config: {
      auth: false,
    },
    handler: async (request, h) => {
      const client = await OpenIDClient.get();
      const authorizationUrl = client.authorizationUrl({
        redirect_uri: getRedirectUri(),
        scope: 'openid email',
      });
      console.log(authorizationUrl);
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
    config: {
      auth: false,
    },
    handler: async (request, h) => {
      console.log(request.query);

      // retrieve token set from OpenID Connect provider
      const client = await OpenIDClient.get();
      const tokenSet = await client.authorizationCallback(
        getRedirectUri(),
        request.query,
      );
      console.log('received and validated tokens %j', tokenSet);
      console.log('validated id_token claims %j', tokenSet.claims);

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
    config: {
      auth: false,
      validate: {
        payload: {
          email: Joi.string().email().required(),
          name: Joi.string().required(),
        },
      },
    },
    handler: async (request) => {
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
    },
  });

  server.route({
    method: 'GET',
    path: '/auth',
    config: {
      auth: { mode: 'try' },
    },
    handler: async (request) => {
      const out = {
        loggedIn: request.auth.isAuthenticated,
      };
      if (out.loggedIn) {
        const { sessionId } = request.state.session;
        const { user } = await request.server.app.cache.get(sessionId);
        const { email, name } = user;
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
    config: {
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
    config: {
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
    config: {
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
    config: {
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
    config: {
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
    config: {
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
    config: {
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
      const { centrelineId, centrelineType } = request.query;
      return CountDAO.byCentreline(centrelineId, centrelineType);
    },
  });

  // COUNT DATA
  server.route({
    method: 'GET',
    path: '/counts/data',
    config: {
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

  // START SERVER

  const { ENV } = config;

  await server.start();
  console.log(`[${ENV}] Server started at: ${server.info.uri}...`);
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
