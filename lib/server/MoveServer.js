import Boom from '@hapi/boom';
import Crumb from '@hapi/crumb';
import hapiAuthCookie from '@hapi/cookie';
import Hapi from '@hapi/hapi';
import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import HapiPino from 'hapi-pino';
import HapiSwagger from 'hapi-swagger';

import packageJson from '@/package.json';
import { AuthScope } from '@/lib/Constants';
import SessionTimeouts from '@/lib/auth/SessionTimeouts';
import config from '@/lib/config/MoveConfig';
import db from '@/lib/db/db';
import UserDAO from '@/lib/db/UserDAO';
import LogTag from '@/lib/log/LogTag';
import Joi from '@/lib/model/Joi';
import User from '@/lib/model/User';
import vueConfig from '@/vue.config';
import Logger from '@/lib/log/Logger';

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

function getRouteAuthMode(route) {
  return (
    route.settings.auth
    && route.settings.auth.mode
  ) || 'try';
}

function getRouteAuthScopes(route) {
  return (
    route.settings.auth
    && route.settings.auth.access
    && route.settings.auth.access[0]
    && route.settings.auth.access[0].scope.selection
  ) || [];
}

function getRouteAuthInfo(route) {
  const mode = getRouteAuthMode(route);
  let scopes = getRouteAuthScopes(route);
  if (scopes.length === 0) {
    if (mode === 'try') {
      return '';
    }
    return ` (mode=${mode})`;
  }
  scopes = scopes.join(',');
  if (mode === 'try') {
    return ` (scopes=${scopes})`;
  }
  return ` (mode=${mode} scopes=${scopes})`;
}

/**
 * Base class for MOVE backend services.  This takes care of security headers, controller
 * management, init / cleanup of service-specific modules, authentication configuration,
 * logging, etc.
 *
 * By keeping all our backend services under a common language, configuration, and set of
 * libraries, we gain a few benefits:
 *
 * - fewer tools / languages / frameworks needed to set up a development environment;
 * - fewer tools / languages / frameworks as dependencies for deployment;
 * - ability to "mix and match" existing components to handle current and future load.
 *
 * The tradeoff is that node.js is a single-threaded runtime, and as such has limited
 * capacity to scale CPU-heavy loads.
 *
 * This is where `MoveServer` dovetails nicely with MOVE architecture: all servers use
 * a single common database, with no other shared resources.  By leaning on database
 * transactional guarantees, then, we can scale by simply launching more `MoveServer`
 * instances on each AWS machine, up to machine capacity.
 *
 * From there, our AWS autoscaling pool and database can each be scaled to handle more
 * load as needed.  (You'd be surprised at how much load a single database can handle,
 * if backed by enough system resources!)
 *
 * @param {string} name - name of this service
 * @param {Object} args - additional options
 */
class MoveServer {
  constructor(name, args) {
    const { port } = args;

    const options = {
      app: { config },
      host: config.host,
      port,
      routes: {
        json: {
          replacer,
        },
        response: {
          failAction,
        },
        /*
         * Security headers are handled at the `nginx` level, either in deployment or in the
         * CloudFormation template.
         */
        security: false,
        validate: {
          failAction,
        },
      },
    };
    if (config.https !== null) {
      const tls = config.https;
      Object.assign(options, { tls });
    }
    this.authOptions = null;
    this.cleanupModules = [];
    this.controllers = [];
    this.docsPath = null;
    this.initModules = [];
    this.name = name;
    this.server = Hapi.server(options);
    this.server.ext('onPreResponse', (request, h) => {
      const { response } = request;
      if (response.isBoom) {
        try {
          Logger.createError(request, LogTag.ERROR, response);
        } catch (err) {
          request.log(LogTag.ERROR, err);
          return h.continue;
        }
      }
      return h.continue;
    });
  }

  addController(controller) {
    this.controllers.push(controller);
    return this;
  }

  addCleanupModule(cleanupModule) {
    this.cleanupModules.push(cleanupModule);
    return this;
  }

  addInitModule(initModule) {
    this.initModules.push(initModule);
    return this;
  }

  enableAuth(options) {
    const defaultOptions = {
      /*
       * For services requiring authentication, we use CSRF by default.  However, we offer the
       * ability to disable CSRF here for testing purposes.
       *
       * (The original use case here was in initial testing of `POST` requests in `scheduler`;
       * it's useful to be able to `curl` these endpoints, but CSRF is designed to prevent
       * exactly that.)
       *
       * Do *NOT* disable this on a production service.
       */
      csrf: true,
    };
    const authOptions = {
      ...defaultOptions,
      ...options,
    };
    this.authOptions = authOptions;
    return this;
  }

  enableDocs(docsPath) {
    this.docsPath = docsPath;
  }

  async configureAuth() {
    this.server.log(LogTag.INIT, 'auth enabled, configuring...');

    // AUTH STRATEGY
    this.server.log(LogTag.INIT, 'configuring auth strategy...');
    this.server.auth.strategy('session', 'cookie', {
      cookie: {
        clearInvalid: true,
        isHttpOnly: true,
        isSameSite: 'Strict',
        isSecure: true,
        name: 'session',
        path: vueConfig.publicPath,
        ttl: SessionTimeouts.TTL_NON_ADMIN,
        ...config.session,
      },
      /*
       * Setting `keepAlive: true` renews the `ttl` expiry period on each request, so that
       * the session expires after the given period of *inactivity*.
       */
      keepAlive: true,
      validateFunc: async (request, session) => {
        const { sessionId } = session;
        const user = await UserDAO.bySessionId(sessionId);
        const valid = user !== null;
        const out = { valid };
        if (out.valid) {
          /*
           * hapi scopes are strings, similar to OAuth scopes - which means we actually don't
           * want full `AuthScope` objects here!  (It's still a good idea to keep the validation,
           * we just need to undo the `Joi.enum()` coercing into `AuthScope` enum instances.)
           */
          const scope = user.scope.map(authScope => authScope.name);
          out.credentials = {
            ...user,
            scope,
          };
        }
        return out;
      },
    });
    this.server.auth.default('session');

    // LIFECYCLE HOOKS
    this.server.ext('onPostAuth', async (request, h) => {
      if (request.auth.credentials !== null) {
        const user = await User.read.validateAsync(request.auth.credentials);
        if (user.scope.includes(AuthScope.ADMIN)) {
          if (config.ENV !== 'test') {
            /*
              * In test environments, we use `InjectBackendClient` to provide mock authentication
              * credentials.  This bypasses the normal authentication process, which means that
              * the authentication cookie is never set, and the `request.cookieAuth.ttl` call
              * below fails.
              *
              * As such, we only perform this TTL update when not in a test environment.
              */
            request.cookieAuth.ttl(SessionTimeouts.TTL_ADMIN);
          }
        }
        /* eslint-disable-next-line no-param-reassign */
        request.auth.credentials = user;
      }
      return h.continue;
    });
  }

  static pluginsCommon() {
    return [
      {
        plugin: HapiPino,
        options: {
          prettyPrint: process.env.NODE_ENV !== 'production',
          redact: [
            'req.headers',
            'req.remoteAddress',
            'req.remotePort',
            'res.headers',
          ],
        },
      },
    ];
  }

  pluginsAuth() {
    const { authOptions } = this;
    if (authOptions === null) {
      return [];
    }

    const pluginsAuth = [
      /*
       * Provides the ability to authenticate using cookies containing session IDs.
       */
      {
        plugin: hapiAuthCookie,
      },
    ];

    if (authOptions.csrf) {
      /*
       * CSRF protection, to mitigate against attacks where malicious actors can replay requests
       * by getting users to click on links / buttons with carefully crafted URLs.
       */
      pluginsAuth.push({
        plugin: Crumb,
        options: {
          cookieOptions: {
            isHttpOnly: true,
            isSameSite: 'Strict',
            isSecure: true,
            path: vueConfig.publicPath,
            ...config.session,
          },
          key: 'csrf',
          restful: true,
        },
      });
    }

    return pluginsAuth;
  }

  pluginsDocs() {
    const { docsPath, name } = this;
    if (docsPath === null) {
      return [];
    }

    return [
      /*
       * REST API documentation, served at `/docs
       * The below config accounts for production deployments being behind a reverse proxy
       * while our local enviroments are not. jsonRoutePath and routesBasePath are necessary
       * for when the app is deployed however they replace jsonPath and swaggerUIPath when included.
       * The local environment needs the docsPath prefix at all times so we conditionally replace
       * the value here.
       */
      Inert,
      Vision,
      {
        plugin: HapiSwagger,
        options: {
          basePath: `${docsPath}/`,
          debug: true,
          documentationPath: '/docs',
          info: {
            title: `MOVE REST API docs: ${name}`,
            version: packageJson.version,
          },
          jsonPath: `${docsPath}/swagger.json`,
          jsonRoutePath: config.ENV === 'production' ? '/swagger.json' : `${docsPath}/swagger.json`,
          routesBasePath: config.ENV === 'production' ? '/swaggerui/' : `${docsPath}/swaggerui/`,
          swaggerUIPath: `${docsPath}/swaggerui/`,
          validatorUrl: null,
        },
      },
    ];
  }

  async configure() {
    // VALIDATION
    this.server.validator(Joi);

    // PLUGINS
    const pluginsCommon = MoveServer.pluginsCommon();
    const pluginsAuth = this.pluginsAuth();
    const pluginsDocs = this.pluginsDocs();

    const plugins = [
      ...pluginsDocs,
      ...pluginsCommon,
      ...pluginsAuth,
    ];

    await this.server.register(plugins);

    // START
    this.server.log(LogTag.INIT, `starting ${this.name} in ${config.ENV} mode...`);
    if (this.authOptions !== null) {
      await this.configureAuth(this.authOptions);
    }

    this.server.log(LogTag.INIT, 'initializing modules...');
    /*
     * `initModules` are initialized sequentially - this allows server instances to manage the
     * initialization order of these modules, unlike a parallel approach.
     */
    for (let i = 0; i < this.initModules.length; i++) {
      const initModule = this.initModules[i];
      /* eslint-disable-next-line no-await-in-loop */
      await initModule.init(this.server);
    }

    // ROUTES
    this.server.log(LogTag.INIT, 'registering routes...');
    this.server.events.on('route', (route) => {
      const routeAuthInfo = getRouteAuthInfo(route);
      this.server.log(
        LogTag.INIT,
        `registered route: ${route.method.toUpperCase()} ${route.path}${routeAuthInfo}`,
      );
    });
    this.controllers.forEach((controller) => {
      this.server.route(controller);
    });
  }

  async initialize() {
    this.handleExit();
    await this.configure();
    await this.server.initialize();
    this.server.log(LogTag.INIT, `Server started at: ${this.server.info.uri}...`);
    return this.server;
  }

  async start() {
    this.handleExit();
    await this.configure();
    await this.server.start();
    this.server.log(LogTag.INIT, `Server started at: ${this.server.info.uri}...`);
    return this.server;
  }

  /**
   * @see https://stackoverflow.com/a/56319808
   */
  handleExit() {
    process.on('beforeExit', async () => {
      /*
       * `cleanupModules` are cleaned up sequentially - this allows server instances to manage
       * the cleanup order of these modules, unlike a parallel approach.
       */
      for (let i = 0; i < this.cleanupModules.length; i++) {
        const cleanupModule = this.cleanupModules[i];
        /* eslint-disable-next-line no-await-in-loop */
        await cleanupModule.cleanup();
      }
      await db.$pool.end();
      await this.server.stop();
      process.exit(0);
    });
  }
}

export default MoveServer;
