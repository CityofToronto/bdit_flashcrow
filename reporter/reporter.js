import csvGenerate from 'csv-generate';
import Boom from '@hapi/boom';
import Good from '@hapi/good';
import Hapi from '@hapi/hapi';
import Joi from '@hapi/joi';

import config from '@/../lib/config/MoveConfig';
import db from '@/../lib/db/db';
import LogTag from '@/../lib/log/LogTag';

// TODO: DRY configuration with server.js
async function failAction(request, h, err) {
  if (config.ENV === 'production') {
    request.log(LogTag.ERROR, `ValidationError: ${err.message}`);
    throw Boom.badRequest('Invalid request payload input');
  } else {
    request.log(LogTag.ERROR, err);
    throw err;
  }
}

// TODO: put this in MoveConfig
const PORT_REPORTER = 8082;

const options = {
  app: { config },
  debug: {
    request: ['error'],
  },
  host: config.host,
  port: PORT_REPORTER,
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
  ]);

  // START
  server.log(LogTag.INIT, `starting MOVE web application server in ${config.ENV} mode...`);

  // ROUTES
  server.events.on('route', (route) => {
    server.log(LogTag.INIT, `registered route: ${route.method.toUpperCase()} ${route.path}`);
  });

  const routes = [];

  routes.push({
    method: 'GET',
    path: '/foo/{id}',
    handler: async request => ({
      method: 'GET',
      ...request.params,
      ...request.query,
    }),
  });

  routes.push({
    method: 'POST',
    path: '/foo/{id}',
    handler: async request => ({
      method: 'POST',
      ...request.params,
      ...request.payload,
    }),
  });

  routes.push({
    method: 'GET',
    path: '/csv-streaming/{n}',
    options: {
      validate: {
        params: {
          n: Joi
            .number()
            .integer()
            .min(1)
            .max(1000)
            .required(),
        },
      },
    },
    handler: async (request, h) => {
      const { n: length } = request.params;
      return h.response(csvGenerate({ length }))
        .type('text/csv');
    },
  });

  server.route(routes);

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
