const Blankie = require('blankie');
const Hapi = require('hapi');
const hapiAuthCookie = require('hapi-auth-cookie');
const Scooter = require('scooter');
const uuid = require('uuid/v4');

const config = require('./lib/config');
const OpenIDClient = require('./lib/auth/OpenIDClient');
const CounterDAO = require('./lib/db/CounterDAO');
const UserDAO = require('./lib/db/UserDAO');
const db = require('./lib/db/db');
const vueConfig = require('./vue.config');

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
      return 'https://flashcrow.intra.dev-toronto.ca/flashcrow/api/auth/openid-connect-callback';
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
        user = { subject: sub, email, token };
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
        const { email } = user;
        out.user = { email };
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
      const token = 'HEADER.PAYLOAD.SIGNATURE';
      let user = await UserDAO.bySubject(sub);
      if (user === null) {
        user = { subject: sub, email, token };
        await UserDAO.create(user);
      } else {
        Object.assign(user, { email, token });
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

  // COUNTER

  server.route({
    method: 'GET',
    path: '/counter',
    config: {
      handler: async () => {
        const counter = await CounterDAO.get();
        return { counter };
      },
    },
  });

  server.route({
    method: 'PUT',
    path: '/counter',
    config: {
      handler: async () => {
        const counter = await CounterDAO.increment();
        return { counter };
      },
    },
  });

  server.route({
    method: 'DELETE',
    path: '/counter',
    config: {
      handler: async () => {
        const counter = await CounterDAO.reset();
        return { counter };
      },
    },
  });

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
