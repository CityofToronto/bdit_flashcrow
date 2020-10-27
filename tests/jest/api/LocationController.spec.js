import { CentrelineType, HttpStatus } from '@/lib/Constants';
import config from '@/lib/config/MoveConfig';
import db from '@/lib/db/db';
import CompositeId from '@/lib/io/CompositeId';
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

function expectSuggestionsContain(result, centrelineId) {
  const suggestedIds = result.map(({ centrelineId: suggestedId }) => suggestedId);
  expect(suggestedIds).toContain(centrelineId);
}

test('LocationController.getLocationSuggestions', async () => {
  const data = {
    q: 'Danforth and Main',
    limit: 3,
  };
  const response = await client.fetch('/locations/suggest', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.length).toBe(3);
  expectSuggestionsContain(response.result, 13460034);
});

test('LocationController.getLocationsByCentreline', async () => {
  // empty list of features
  let features = [];
  let s1 = CompositeId.encode(features);
  let data = { s1 };
  let response = await client.fetch('/locations/byCentreline', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toEqual([]);

  // valid multi-fetch
  features = [
    { centrelineId: 13447240, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 111569, centrelineType: CentrelineType.SEGMENT },
  ];
  s1 = CompositeId.encode(features);
  data = { s1 };
  response = await client.fetch('/locations/byCentreline', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.length).toEqual(features.length);
  response.result.forEach(({ centrelineId, centrelineType }, i) => {
    expect({ centrelineId, centrelineType }).toEqual(features[i]);
  });
});
