import { HttpStatus } from '@/lib/Constants';
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

test('DynamicTileController.getDynamicTile [invalid layer]', async () => {
  let response = await client.fetch('/dynamicTiles/noSuchLayer/0/0/0.pbf');
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);

  response = await client.fetch('/dynamicTiles/collisionsLevel1/2/3/4.pbf');
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);

  response = await client.fetch('/dynamicTiles/studies:blarghl/4/5/6.pbf');
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);
});

test('DynamicTileController.getDynamicTile [sample tile]', async () => {
  const response = await client.fetch('/dynamicTiles/studies:10/15/9162/11956.pbf');
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.headers['content-type']).toEqual('application/vnd.mapbox-vector-tile');
});
