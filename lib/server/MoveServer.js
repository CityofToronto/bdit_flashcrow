import Boom from '@hapi/boom';
import Crumb from '@hapi/crumb';
import hapiAuthCookie from '@hapi/cookie';
import Good from '@hapi/good';
import Hapi from '@hapi/hapi';
import Scooter from '@hapi/scooter';
import Blankie from 'blankie';
import Joi from '@/lib/model/Joi';

import config from '@/lib/config/MoveConfig';
import db from '@/lib/db/db';
import LogTag from '@/lib/log/LogTag';
import User from '@/lib/model/User';
import vueConfig from '@/vue.config';

const SHUTDOWN_EVENTS = ['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException', 'SIGTERM'];

function replacer(key, value) {
  if (value instanceof Map || value instanceof Set) {
    return [...value];
  }
  return value;
}

async function failAction(request, h, err) {
  if (config.ENV === 'production') {
    request.log(LogTag.ERROR, `ValidationError: ${err.message}`);
    throw Boom.badRequest('Invalid request payload input');
  } else {
    request.log(LogTag.ERROR, err);
    throw err;
  }
}

class MoveServer {
  constructor(name, args) {
    const { port } = args;

    const options = {
      app: { config },
      debug: {
        request: ['error'],
      },
      host: config.host,
      port,
      routes: {
        json: {
          replacer,
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
    this.auth = false;
    this.controllers = [];
    this.initModules = [];
    this.name = name;
    this.server = Hapi.server(options);
  }

  addController(controller) {
    this.controllers.push(controller);
    return this;
  }

  addInitModule(initModule) {
    this.initModules.push(initModule);
    return this;
  }

  enableAuth() {
    this.auth = true;
    return this;
  }

  async configureAuth() {
    this.server.log(LogTag.INIT, 'auth enabled, configuring...');

    // SESSION CACHE
    this.server.log(LogTag.INIT, 'configuring session cache...');
    const cache = this.server.cache({
      segment: 'sessions',
      expiresIn: 3 * 24 * 60 * 60 * 1000,
    });
    this.server.app.cache = cache;

    // AUTH STRATEGY
    this.server.log(LogTag.INIT, 'configuring auth strategy...');
    this.server.auth.strategy('session', 'cookie', {
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
    this.server.auth.default('session');

    // LIFECYCLE HOOKS
    this.server.ext('onPostAuth', async (request, h) => {
      if (request.auth.credentials !== null) {
        /* eslint-disable-next-line no-param-reassign */
        request.auth.credentials = await User.read.validateAsync(request.auth.credentials);
      }
      return h.continue;
    });
  }

  static pluginsCommon() {
    return [
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
    ];
  }

  static pluginsAuth() {
    return [
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
       * CSRF protection, to mitigate against attacks where malicious actors can replay requests
       * by getting users to click on links / buttons with carefully crafted URLs.
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
    ];
  }

  async configure() {
    // VALIDATION
    this.server.validator(Joi);

    // PLUGINS
    let plugins = MoveServer.pluginsCommon();
    if (this.auth) {
      plugins = [
        ...plugins,
        ...MoveServer.pluginsAuth(),
      ];
    }
    await this.server.register(plugins);

    // START
    this.server.log(LogTag.INIT, `starting ${this.name} in ${config.ENV} mode...`);
    if (this.auth) {
      await this.configureAuth();
    }

    this.server.log(LogTag.INIT, 'initializing modules...');
    /*
     * `initModules` are initialized sequentially - this allows callsites to manage the
     * initialization order of these modules, unlike a parallel approach.
     */
    for (let i = 0; i < this.initModules.length; i++) {
      const initModule = this.initModules[i];
      /* eslint-disable-next-line no-await-in-loop */
      await initModule.init();
    }

    // ROUTES
    this.server.log(LogTag.INIT, 'registering routes...');
    this.server.events.on('route', (route) => {
      this.server.log(LogTag.INIT, `registered route: ${route.method.toUpperCase()} ${route.path}`);
    });
    this.controllers.forEach((controller) => {
      this.server.route(controller);
    });
  }

  async initialize() {
    this.trapSignals();
    await this.configure();
    await this.server.initialize();
    this.server.log(LogTag.INIT, `Server started at: ${this.server.info.uri}...`);
    return this.server;
  }

  async start() {
    this.trapSignals();
    await this.configure();
    await this.server.start();
    this.server.log(LogTag.INIT, `Server started at: ${this.server.info.uri}...`);
    return this.server;
  }

  trapSignals() {
    SHUTDOWN_EVENTS.forEach((event) => {
      process.on(event, () => {
        db.$pool.end();
        this.server.stop();
      });
    });
  }
}

export default MoveServer;
