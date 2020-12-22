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

test('LocationController.getCompositeId', async () => {
  const features = [
    { centrelineId: 13441579, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 111569, centrelineType: CentrelineType.SEGMENT },
  ];
  const data = {
    centrelineId: features.map(({ centrelineId }) => centrelineId),
    centrelineType: features.map(({ centrelineType }) => centrelineType),
  };
  const response = await client.fetch('/locations/compositeId', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  const { s1 } = response.result;
  expect(CompositeId.decode(s1)).toEqual(features);
});

test('LocationController.getCompositeId [length mismatch]', async () => {
  const data = {
    centrelineId: [13441579, 111569],
    centrelineType: [CentrelineType.SEGMENT],
  };
  const response = await client.fetch('/locations/compositeId', { data });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);
});

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

test('LocationController.getLocationsByCorridor [empty]', async () => {
  const features = [];
  const s1 = CompositeId.encode(features);
  const data = { s1 };
  const response = await client.fetch('/locations/byCorridor', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toEqual([]);
});

test('LocationController.getLocationsByCorridor [short corridor]', async () => {
  const features = [
    { centrelineId: 13456067, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 444912, centrelineType: CentrelineType.SEGMENT },
  ];
  let s1 = CompositeId.encode(features);
  const data = { s1 };
  const response = await client.fetch('/locations/byCorridor', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  const locations = response.result;
  s1 = CompositeId.encode(locations);
  expect(CompositeId.decode(s1)).toEqual([
    { centrelineId: 13456067, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 445623, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13455700, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 445346, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13455359, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 445100, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13455130, centrelineType: CentrelineType.INTERSECTION },
    features[1],
  ]);
});

test('LocationController.getLocationsByCorridor [too many input features]', async () => {
  const features = [
    { centrelineId: 445623, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13455700, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 445346, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13455359, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 445100, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13455130, centrelineType: CentrelineType.INTERSECTION },
  ];
  const s1 = CompositeId.encode(features);
  const data = { s1 };
  const response = await client.fetch('/locations/byCorridor', { data });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);
});

test('LocationController.getLocationsByCorridor [too many output features]', async () => {
  const features = [
    { centrelineId: 13463436, centrelineType: CentrelineType.INTERSECTION },
    { centrelineId: 13459445, centrelineType: CentrelineType.INTERSECTION },
  ];
  const s1 = CompositeId.encode(features);
  const data = { s1 };
  const response = await client.fetch('/locations/byCorridor', { data });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);
});

test('LocationController.getLocationsByCorridor [no corridor found]', async () => {
  const features = [
    { centrelineId: 30106479, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13232810, centrelineType: CentrelineType.SEGMENT },
  ];
  const s1 = CompositeId.encode(features);
  const data = { s1 };
  const response = await client.fetch('/locations/byCorridor', { data });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);
});
