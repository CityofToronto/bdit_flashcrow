import Boom from '@hapi/boom';
import Crumb from '@hapi/crumb';
import hapiAuthCookie from '@hapi/cookie';
import Good from '@hapi/good';
import Hapi from '@hapi/hapi';
import Scooter from '@hapi/scooter';
import Blankie from 'blankie';
import Joi from '@/lib/model/Joi';

import config from '@/lib/config/MoveConfig';
import AuthController from '@/lib/controller/AuthController';
import CollisionController from '@/lib/controller/CollisionController';
import CountController from '@/lib/controller/CountController';
import DynamicTileController from '@/lib/controller/DynamicTileController';
import LocationController from '@/lib/controller/LocationController';
import PoiController from '@/lib/controller/PoiController';
import StudyController from '@/lib/controller/StudyController';
import StudyRequestController from '@/lib/controller/StudyRequestController';
import UserController from '@/lib/controller/UserController';
import db from '@/lib/db/db';
import LogTag from '@/lib/log/LogTag';
import User from '@/lib/model/User';
import vueConfig from '@/vue.config';

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

async function configureServer() {
  // VALIDATION
  server.validator(Joi);

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

  // LIFECYCLE HOOKS
  server.ext('onPostAuth', async (request, h) => {
    if (request.auth.credentials !== null) {
      /* eslint-disable-next-line no-param-reassign */
      request.auth.credentials = await User.read.validateAsync(request.auth.credentials);
    }
    return h.continue;
  });

  // ROUTES
  server.events.on('route', (route) => {
    server.log(LogTag.INIT, `registered route: ${route.method.toUpperCase()} ${route.path}`);
  });
  server.log(LogTag.INIT, 'registering routes...');
  server.route(AuthController);
  server.route(CollisionController);
  server.route(CountController);
  server.route(DynamicTileController);
  server.route(LocationController);
  server.route(PoiController);
  server.route(StudyController);
  server.route(StudyRequestController);
  server.route(UserController);
}

async function initialize() {
  await configureServer();
  await server.initialize();
  server.log(LogTag.INIT, 'Server initialized for testing...');
  return server;
}

async function start() {
  await configureServer();
  await server.start();
  server.log(LogTag.INIT, `Server started at: ${server.info.uri}...`);
  return server;
}

const shutdownEvents = ['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException', 'SIGTERM'];
function onShutdown() {
  db.$pool.end();
  server.stop();
}
shutdownEvents.forEach((event) => {
  process.on(event, onShutdown);
});

const MoveServer = { initialize, start };

export {
  MoveServer as default,
  initialize,
  start,
};
