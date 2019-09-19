import fs from 'fs';
import path from 'path';
import util from 'util';

import csvGenerate from 'csv-generate';
import Excel from 'exceljs';
import Boom from '@hapi/boom';
import Good from '@hapi/good';
import Hapi from '@hapi/hapi';
import Joi from '@hapi/joi';
import JSZip from 'jszip';

import ReportController from './ReportController';
import config from '@/../lib/config/MoveConfig';
import db from '@/../lib/db/db';
import LogTag from '@/../lib/log/LogTag';
import MovePDFDocument from './MovePDFDocument';
import SSEStream from './SSEStream';

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

  function generateExcel() {
    const workbook = new Excel.Workbook();
    const sheet = workbook.addWorksheet('MOVE Reporter Test', {
      pageSetup: {
        orientation: 'landscape',
      },
    });
    // add image to cell
    const imageId = workbook.addImage({
      buffer: imageData,
      extension: 'png',
    });
    sheet.addImage(imageId, 'A1');
    // add Date to cell
    sheet.getCell('B1').value = new Date();
    // merge cells horizontally
    sheet.mergeCells('C1:E1');
    sheet.getCell('C1').value = 'horizontal!';
    // add table of data
    const rows = [
      { name: 'Foo', count: 1729 },
      { name: 'Bar', count: 42 },
      { name: 'Quux', count: 6 },
    ];
    rows.forEach(({ name, count }, i) => {
      const row = i + 2;
      sheet.getCell(`B${row}`).value = name;
      sheet.getCell(`C${row}`).value = count;
    });
    // add another table, this time as input to a chart
    chartData.forEach((value, i) => {
      const row = i + 2;
      sheet.getCell(`D${row}`).value = value;
    });
    // merge cells vertically
    sheet.mergeCells('A5:A7');
    sheet.getCell('A6').value = 'vertical!';

    const xlsxStream = new SSEStream();
    workbook.xlsx.write(xlsxStream);
    return xlsxStream;
  }

  routes.push({
    method: 'GET',
    path: '/stream/excel',
    handler: async (request, h) => {
      const excelStream = generateExcel();
      return h.response(excelStream)
        .type('application/vnd.ms-excel');
    },
  });

  function generatePDF() {
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
    return doc;
  }

  routes.push({
    method: 'GET',
    path: '/stream/pdf',
    handler: async (request, h) => {
      const pdfStream = generatePDF();
      return h.response(pdfStream)
        .type('application/pdf');
    },
  });

  const ZIP_DEFAULT_COMPRESSION_LEVEL = 6;

  routes.push({
    method: 'GET',
    path: '/stream/zip',
    handler: async (request, h) => {
      const zip = new JSZip();

      const reportsFolder = zip
        .folder('MOVE-reports')
        .folder('RESCU')
        .folder('Don-Mills-and-Overlea');

      reportsFolder.file('cot_logo.png', imageData);

      const pdfStream = generatePDF();
      reportsFolder.file('report.pdf', pdfStream);

      const excelStream = generateExcel();
      reportsFolder.file('report.xlsx', excelStream);

      const zipOptions = {
        compression: 'DEFLATE',
        compressionOptions: {
          level: ZIP_DEFAULT_COMPRESSION_LEVEL,
        },
        streamFiles: true,
      };

      const zipStream = zip.generateNodeStream(zipOptions);
      return h.response(zipStream)
        .type('application/zip');
    },
  });

  server.route(routes);
  server.route(ReportController);

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
