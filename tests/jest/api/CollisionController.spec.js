import { CentrelineType, HttpStatus } from '@/lib/Constants';
import config from '@/lib/config/MoveConfig';
import db from '@/lib/db/db';
import CompositeId from '@/lib/io/CompositeId';
import InjectBackendClient from '@/lib/test/api/InjectBackendClient';
import DateTime from '@/lib/time/DateTime';
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

test('CollisionController.getCollisionFactors', async () => {
  const response = await client.fetch('/collisions/factors');
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  const collisionFactors = new Map(
    response.result.map(([field, fieldEntries]) => [field, new Map(fieldEntries)]),
  );
  expect(collisionFactors.get('acclass')).toBeInstanceOf(Map);
  expect(collisionFactors.get('acclass').get(1)).toEqual({
    code: 'FA',
    description: 'Fatal',
  });
});

test('CollisionController.getCollisionByCollisionId', async () => {
  let response = await client.fetch('/collisions/999999999');
  expect(response.statusCode).toBe(HttpStatus.NOT_FOUND.statusCode);

  response = await client.fetch('/collisions/2013:3001175197');
  expect(response.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR.statusCode);

  response = await client.fetch('/collisions/2012:1288425');
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.centrelineId).toBe(1142194);
  expect(response.result.centrelineType).toBe(CentrelineType.SEGMENT);
  expect(response.result.involved).toHaveLength(2);
});

// skip: the values under observation is randonly generated and therefore insconsistent
test.skip('CollisionController.getCollisionsByCentreline', async () => {
  const dateRangeStart = DateTime.fromObject({ year: 2017, month: 1, day: 1 });
  const dateRangeEnd = DateTime.fromObject({ year: 2020, month: 1, day: 1 });

  let features = [
    { centrelineId: 1142194, centrelineType: CentrelineType.SEGMENT },
  ];
  let collisionQuery = {
    dateRangeEnd,
    dateRangeStart,
  };
  let s1 = CompositeId.encode(features);
  let data = {
    s1,
    ...collisionQuery,
  };
  let response = await client.fetch('/collisions/byCentreline', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toHaveLength(31);

  features = [
    { centrelineId: 13465434, centrelineType: CentrelineType.INTERSECTION },
  ];
  collisionQuery = {
    dateRangeEnd,
    dateRangeStart,
  };
  s1 = CompositeId.encode(features);
  data = {
    s1,
    ...collisionQuery,
  };
  response = await client.fetch('/collisions/byCentreline', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toHaveLength(26);
});

// skip: the values under observation is randonly generated and therefore insconsistent
test.skip('CollisionController.getCollisionsByCentrelineSummary', async () => {
  const dateRangeStart = DateTime.fromObject({ year: 2017, month: 1, day: 1 });
  const dateRangeEnd = DateTime.fromObject({ year: 2020, month: 1, day: 1 });

  let features = [
    { centrelineId: 1142194, centrelineType: CentrelineType.SEGMENT },
  ];
  let collisionQuery = {
    dateRangeEnd,
    dateRangeStart,
  };
  let s1 = CompositeId.encode(features);
  let data = {
    s1,
    ...collisionQuery,
  };
  let response = await client.fetch('/collisions/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toEqual({ amount: 31, ksi: 0, validated: 7 });

  features = [
    { centrelineId: 13465434, centrelineType: CentrelineType.INTERSECTION },
  ];
  collisionQuery = {
    dateRangeEnd,
    dateRangeStart,
  };
  s1 = CompositeId.encode(features);
  data = {
    s1,
    ...collisionQuery,
  };
  response = await client.fetch('/collisions/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toEqual({ amount: 26, ksi: 1, validated: 14 });

  features = [
    { centrelineId: 1142194, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13465434, centrelineType: CentrelineType.INTERSECTION },
  ];
  collisionQuery = {
    dateRangeEnd,
    dateRangeStart,
  };
  s1 = CompositeId.encode(features);
  data = {
    s1,
    ...collisionQuery,
  };
  response = await client.fetch('/collisions/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toEqual({ amount: 57, ksi: 1, validated: 21 });
});

// skip: the values under observation is randonly generated and therefore insconsistent
test.skip('CollisionController.getCollisionsByCentrelineSummaryPerLocation', async () => {
  const dateRangeStart = DateTime.fromObject({ year: 2017, month: 1, day: 1 });
  const dateRangeEnd = DateTime.fromObject({ year: 2020, month: 1, day: 1 });

  let features = [
    { centrelineId: 1142194, centrelineType: CentrelineType.SEGMENT },
  ];
  let collisionQuery = {
    dateRangeEnd,
    dateRangeStart,
  };
  let s1 = CompositeId.encode(features);
  let data = {
    s1,
    ...collisionQuery,
  };
  let response = await client.fetch('/collisions/byCentreline/summaryPerLocation', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toEqual([{ amount: 31, ksi: 0, validated: 7 }]);

  features = [
    { centrelineId: 13465434, centrelineType: CentrelineType.INTERSECTION },
  ];
  collisionQuery = {
    dateRangeEnd,
    dateRangeStart,
  };
  s1 = CompositeId.encode(features);
  data = {
    s1,
    ...collisionQuery,
  };
  response = await client.fetch('/collisions/byCentreline/summaryPerLocation', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toEqual([{ amount: 26, ksi: 1, validated: 14 }]);

  features = [
    { centrelineId: 1142194, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13465434, centrelineType: CentrelineType.INTERSECTION },
  ];
  collisionQuery = {
    dateRangeEnd,
    dateRangeStart,
  };
  s1 = CompositeId.encode(features);
  data = {
    s1,
    ...collisionQuery,
  };
  response = await client.fetch('/collisions/byCentreline/summaryPerLocation', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toEqual([
    { amount: 31, ksi: 0, validated: 7 },
    { amount: 26, ksi: 1, validated: 14 },
  ]);
});

test('CollisionController.getCollisionsByCentrelineTotal', async () => {
  let features = [
    { centrelineId: 1142194, centrelineType: CentrelineType.SEGMENT },
  ];
  let s1 = CompositeId.encode(features);
  let data = { s1 };
  let response = await client.fetch('/collisions/byCentreline/total', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.total).toBeGreaterThanOrEqual(212);

  features = [
    { centrelineId: 13465434, centrelineType: CentrelineType.INTERSECTION },
  ];
  s1 = CompositeId.encode(features);
  data = { s1 };
  response = await client.fetch('/collisions/byCentreline/total', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.total).toBeGreaterThanOrEqual(184);

  features = [
    { centrelineId: 1142194, centrelineType: CentrelineType.SEGMENT },
    { centrelineId: 13465434, centrelineType: CentrelineType.INTERSECTION },
  ];
  s1 = CompositeId.encode(features);
  data = { s1 };
  response = await client.fetch('/collisions/byCentreline/total', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.total).toBeGreaterThanOrEqual(400);
});
