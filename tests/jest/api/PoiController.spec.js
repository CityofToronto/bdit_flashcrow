import { CentrelineType, HttpStatus } from '@/lib/Constants';
import config from '@/lib/config/MoveConfig';
import db from '@/lib/db/db';
import InjectBackendClient from '@/lib/test/api/InjectBackendClient';
import WebServer from '@/web/WebServer';

let server;
let client;

beforeAll(async () => {
  const webServer = new WebServer({ port: config.port });
  server = await webServer.initialize();
  client = new InjectBackendClient(server);
}, 60000);
afterAll(async () => {
  await server.stop();
  db.$pool.end();
}, 60000);

test('PoiController.getPoiByCentrelineSummary', async () => {
  let data = {
    centrelineId: 1142194,
    centrelineType: CentrelineType.SEGMENT,
    radius: 1000,
  };
  let response = await client.fetch('/poi/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toEqual({
    hospital: null,
    school: { id: 898, geom_dist: 296.029139382713 },
  });

  data = {
    centrelineId: 1142194,
    centrelineType: CentrelineType.SEGMENT,
    radius: 250,
  };
  response = await client.fetch('/poi/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toEqual({
    hospital: null,
    school: null,
  });

  data = {
    centrelineId: 13465434,
    centrelineType: CentrelineType.INTERSECTION,
    radius: 1000,
  };
  response = await client.fetch('/poi/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toEqual({
    hospital: { id: 1497390, geom_dist: 81.760698352711 },
    school: { id: 141, geom_dist: 57.2059638042636 },
  });

  data = {
    centrelineId: 13465434,
    centrelineType: CentrelineType.INTERSECTION,
    radius: 60,
  };
  response = await client.fetch('/poi/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toEqual({
    hospital: null,
    school: { id: 141, geom_dist: 57.2059638042636 },
  });
});
