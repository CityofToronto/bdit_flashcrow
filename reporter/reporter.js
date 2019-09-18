import fs from 'fs';
import path from 'path';
import util from 'util';

import csvGenerate from 'csv-generate';
import Boom from '@hapi/boom';
import Good from '@hapi/good';
import Hapi from '@hapi/hapi';
import Joi from '@hapi/joi';

import config from '@/../lib/config/MoveConfig';
import db from '@/../lib/db/db';
import LogTag from '@/../lib/log/LogTag';
import MovePDFDocument from './MovePDFDocument';

const readFile = util.promisify(fs.readFile);

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

  const cotLogoPath = path.join(__dirname, 'cot_logo.png');
  const imageData = await readFile(cotLogoPath);

  const chartData = [];
  for (let i = 0; i < 10; i++) {
    const value = Math.floor(Math.random() * 1000);
    chartData.push(value);
  }

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
    path: '/stream/csv/{n}',
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

  routes.push({
    method: 'GET',
    path: '/stream/xls',
    handler: async () => ({ todo: true }),
  });

  routes.push({
    method: 'GET',
    path: '/stream/pdf',
    handler: async (request, h) => {
      const doc = new MovePDFDocument({
        layout: 'landscape',
        size: 'letter',
      });
      // write text (to active page)
      doc.text('Hello World!', 18, 18);
      // draw image
      doc.image(imageData, 18, 54, { fit: [144, 108] });
      // draw chart
      doc.chart(chartData, 18, 144, 288, 216);
      doc.text('after chart');
      // add a page, and make it the active page
      doc.addPage();
      /*
       * Generate a table.  There also appear to be lower-level utilities for
       * generating individual rows and cells.
       */
      const headers = [
        { text: 'Name', key: 'name' },
        { text: 'Count', key: 'count' },
      ];
      const rows = [
        { name: 'Foo', count: 1729 },
        { name: 'Bar', count: 42 },
        { name: 'Quux', count: 6 },
      ];
      doc.table({ headers, rows }, 18, 90);
      doc.text('after table');
      doc.end();

      return h.response(doc)
        .type('application/pdf');
    },
  });

  routes.push({
    method: 'GET',
    path: '/stream/zip',
    handler: async () => ({ todo: true }),
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
