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

// skip: the values under observation is randonly generated and therefore insconsistent
test.skip('PoiController.getPoiByCentrelineSummary', async () => {
  let data = {
    centrelineId: 1142194,
    centrelineType: CentrelineType.SEGMENT,
    radius: 1000,
  };
  let response = await client.fetch('/poi/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.hospital).toEqual(null);
  expect(response.result.school.id).toEqual(998);
  expect(response.result.school.geom_dist).toBeCloseTo(296.029139382713);

  data = {
    centrelineId: 1142194,
    centrelineType: CentrelineType.SEGMENT,
    radius: 250,
  };
  response = await client.fetch('/poi/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.hospital).toEqual(null);
  expect(response.result.school).toEqual(null);

  data = {
    centrelineId: 13465434,
    centrelineType: CentrelineType.INTERSECTION,
    radius: 1000,
  };
  response = await client.fetch('/poi/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.hospital.id).toEqual(1497390);
  expect(response.result.hospital.geom_dist).toBeCloseTo(81.760698352711);
  expect(response.result.school.id).toEqual(141);
  expect(response.result.school.geom_dist).toBeCloseTo(57.2059638042636);

  data = {
    centrelineId: 13465434,
    centrelineType: CentrelineType.INTERSECTION,
    radius: 60,
  };
  response = await client.fetch('/poi/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.hospital).toEqual(null);
  expect(response.result.school.id).toEqual(141);
  expect(response.result.school.geom_dist).toBeCloseTo(57.2059638042636);
});
