const Boom = require('@hapi/boom');
const Crumb = require('@hapi/crumb');
const hapiAuthCookie = require('@hapi/cookie');
const Good = require('@hapi/good');
const Hapi = require('@hapi/hapi');
const Scooter = require('@hapi/scooter');
const Blankie = require('blankie');

const config = require('./lib/config/MoveConfig');
const AuthController = require('./lib/controller/AuthController');
const CountController = require('./lib/controller/CountController');
const LocationController = require('./lib/controller/LocationController');
const StudyController = require('./lib/controller/StudyController');
const StudyRequestController = require('./lib/controller/StudyRequestController');
const WebInitController = require('./lib/controller/WebInitController');
const db = require('./lib/db/db');
const LogTag = require('./lib/log/LogTag');
const vueConfig = require('./vue.config');

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
    json: {
      replacer(key, value) {
        if (value instanceof Map || value instanceof Set) {
          return [...value];
        }
        return value;
      },
    },
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
if (config.https !== null) {
  const tls = config.https;
  Object.assign(options, { tls });
}
const server = Hapi.server(options);

async function initServer() {
  // PLUGINS
  await server.register([
    /*
     * Logging for Hapi.  `good-squeeze` allows us to filter which log messages get
     * written out, while `good-console` writes said log messages out to console.
     */
    {
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
                request: '*',
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
    },
    /*
     * Provides the ability to authenticate using cookies containing session IDs.
     */
    {
      plugin: hapiAuthCookie,
    },
    /*
     * Provides structured User-Agent information for use by Blankie.
     */
    Scooter,
    /*
     * Content-Security-Policy header, enabling us to be very specific about what can and cannot
     * be embedded into different parts of the site.
     */
    {
      plugin: Blankie,
      options: {},
    },
    /*
     * CSRF protection, to mitigate against attacks where malicious actors can replay requests by
     * getting users to click on URLs.
     */
    {
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
    },
  ]);

  // START
  server.log(LogTag.INIT, `starting MOVE web application server in ${config.ENV} mode...`);

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
  server.events.on('route', (route) => {
    server.log(LogTag.INIT, `registered route: ${route.method.toUpperCase()} ${route.path}`);
  });
  server.log(LogTag.INIT, 'registering routes...');
  server.route(AuthController);
  server.route(CountController);
  server.route(LocationController);
  server.route(StudyController);
  server.route(StudyRequestController);
  server.route(WebInitController);

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
