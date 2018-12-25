const Hapi = require('hapi');
const hapiAuthCookie = require('hapi-auth-cookie');
const uuid = require('uuid/v4');

const config = require('./lib/config');
const CounterDAO = require('./lib/db/CounterDAO');
const db = require('./lib/db/db');

const options = {
  app: { config },
  host: config.host,
  port: config.port,
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

  const cache = server.cache({
    segment: 'sessions',
    expiresIn: 3 * 24 * 60 * 60 * 1000,
  });
  server.app.cache = cache;
  server.auth.strategy('session', 'cookie', {
    ...config.session,
    validateFunc: async (request, session) => {
      const cached = await cache.get(session.sessionId);
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

  server.route({
    method: 'POST',
    path: '/login',
    config: {
      auth: false,
      handler: async (request, h) => {
        if (request.auth.isAuthenticated) {
          return h.redirect(config.BASE_URL);
        }
        const { username, password } = request.payload;
        const { credentials } = config;
        if (username === credentials.username && password === credentials.password) {
          const user = { id: 42, username, password };
          const sessionId = uuid();
          await request.server.app.cache.set(sessionId, { user }, 0);
          request.cookieAuth.set({ sessionId });
        }
        return h.redirect(config.BASE_URL);
      },
    },
  });

  server.route({
    method: 'GET',
    path: '/logout',
    config: {
      handler: async (request, h) => {
        request.server.app.cache.drop(request.state.sessionId.sessionId);
        request.cookieAuth.clear();
        return h.redirect(config.BASE_URL);
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
