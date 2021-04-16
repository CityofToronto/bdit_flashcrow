import {
  CentrelineType,
  HttpStatus,
  StudyHours,
  StudyType,
} from '@/lib/Constants';
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

function expectNumPerCategoryStudy(actual, expected) {
  expect(actual).toHaveLength(expected.length);
  expected.forEach(([n0, value0], i) => {
    const { category: { studyType: { name: value } }, n } = actual[i];
    expect(n).toBe(n0);
    expect(value).toBe(value0);
  });
}

function expectNumPerCategoryAndLocationStudy(actual, expected) {
  expect(actual).toHaveLength(expected.length);
  expected.forEach(([ns0, value0], i) => {
    const { category: { studyType: { name: value } }, perLocation } = actual[i];
    perLocation.forEach(({ n }, j) => {
      expect(n).toBe(ns0[j]);
    });
    expect(value).toBe(value0);
  });
}

test('StudyController.getStudiesByCentrelineSummary', async () => {
  // invalid feature
  let features = [
    { centrelineId: 0, centrelineType: CentrelineType.INTERSECTION },
  ];
  let s1 = CompositeId.encode(features);
  let data = { s1 };
  let response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);

  // empty date range (start > end): returns empty results
  let dateRangeStart = DateTime.fromObject({ year: 2018, month: 1, day: 1 });
  let dateRangeEnd = DateTime.fromObject({ year: 2017, month: 12, day: 31 });
  features = [
    { centrelineId: 30000549, centrelineType: CentrelineType.INTERSECTION },
  ];
  s1 = CompositeId.encode(features);
  data = {
    dateRangeEnd,
    dateRangeStart,
    s1,
  };
  response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toEqual([]);

  // centreline feature with no counts
  features = [
    { centrelineId: 30062737, centrelineType: CentrelineType.SEGMENT },
  ];
  s1 = CompositeId.encode(features);
  data = { s1 };
  response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toEqual([]);

  // centreline feature with some counts
  features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  s1 = CompositeId.encode(features);
  data = { s1 };
  response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerCategoryStudy(
    response.result,
    [[4, 'ATR_VOLUME'], [2, 'ATR_SPEED_VOLUME']],
  );

  // valid feature with some counts, date range filters to empty
  dateRangeStart = DateTime.fromObject({ year: 2018, month: 1, day: 1 });
  dateRangeEnd = DateTime.fromObject({ year: 2019, month: 1, day: 1 });
  features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  s1 = CompositeId.encode(features);
  data = {
    dateRangeEnd,
    dateRangeStart,
    s1,
  };
  response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toEqual([]);

  // valid feature with some counts, filter by type
  features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  s1 = CompositeId.encode(features);
  data = {
    s1,
    studyTypes: [StudyType.ATR_SPEED_VOLUME],
  };
  response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerCategoryStudy(response.result, [[2, 'ATR_SPEED_VOLUME']]);

  // valid feature with some counts, filter by day of week
  features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  s1 = CompositeId.encode(features);
  data = {
    daysOfWeek: [2, 3, 4],
    s1,
  };
  response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerCategoryStudy(response.result, [[3, 'ATR_VOLUME'], [2, 'ATR_SPEED_VOLUME']]);

  // intersection with some counts
  features = [
    { centrelineId: 13446886, centrelineType: CentrelineType.INTERSECTION },
  ];
  s1 = CompositeId.encode(features);
  data = { s1 };
  response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerCategoryStudy(response.result, [[6, 'TMC']]);

  // intersection with some counts, filter by date
  dateRangeStart = DateTime.fromObject({ year: 2011, month: 1, day: 1 });
  dateRangeEnd = DateTime.fromObject({ year: 2019, month: 1, day: 1 });
  features = [
    { centrelineId: 13446886, centrelineType: CentrelineType.INTERSECTION },
  ];
  s1 = CompositeId.encode(features);
  data = {
    dateRangeEnd,
    dateRangeStart,
    s1,
  };
  response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerCategoryStudy(response.result, [[3, 'TMC']]);

  // intersection with some counts, filter by study hours
  features = [
    { centrelineId: 13446886, centrelineType: CentrelineType.INTERSECTION },
  ];
  s1 = CompositeId.encode(features);
  data = {
    hours: [StudyHours.SCHOOL],
    s1,
  };
  response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerCategoryStudy(response.result, []);

  // intersection with some counts, filter by days of week
  features = [
    { centrelineId: 13446886, centrelineType: CentrelineType.INTERSECTION },
  ];
  s1 = CompositeId.encode(features);
  data = {
    daysOfWeek: [0, 1, 5, 6],
    s1,
  };
  response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerCategoryStudy(response.result, [[2, 'TMC']]);

  // intersection with some counts, filter by type of study
  features = [
    { centrelineId: 13446886, centrelineType: CentrelineType.INTERSECTION },
  ];
  s1 = CompositeId.encode(features);
  data = {
    s1,
    studyTypes: [StudyType.TMC],
  };
  response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerCategoryStudy(response.result, [[6, 'TMC']]);

  // intersection with some counts, filter by type of study (non-TMC)
  features = [
    { centrelineId: 13446886, centrelineType: CentrelineType.INTERSECTION },
  ];
  s1 = CompositeId.encode(features);
  data = {
    s1,
    studyTypes: [StudyType.ATR_SPEED_VOLUME],
  };
  response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerCategoryStudy(response.result, []);
});

test('StudyController.getStudiesByCentreline', async () => {
  // invalid feature
  let features = [
    { centrelineId: 0, centrelineType: CentrelineType.INTERSECTION },
  ];
  let s1 = CompositeId.encode(features);
  let data = {
    limit: 10,
    offset: 0,
    s1,
  };
  let response = await client.fetch('/studies/byCentreline', { data });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);

  // empty date range (start > end): returns empty results
  let dateRangeStart = DateTime.fromObject({ year: 2018, month: 1, day: 1 });
  let dateRangeEnd = DateTime.fromObject({ year: 2017, month: 12, day: 31 });
  features = [
    { centrelineId: 30000549, centrelineType: CentrelineType.INTERSECTION },
  ];
  s1 = CompositeId.encode(features);
  data = {
    dateRangeEnd,
    dateRangeStart,
    limit: 10,
    offset: 0,
    s1,
  };
  response = await client.fetch('/studies/byCentreline', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.length).toBe(0);

  // centreline feature with no counts
  features = [
    { centrelineId: 30062737, centrelineType: CentrelineType.SEGMENT },
  ];
  s1 = CompositeId.encode(features);
  data = {
    limit: 10,
    offset: 0,
    s1,
  };
  response = await client.fetch('/studies/byCentreline', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.length).toBe(0);

  // valid feature with less than maxPerCategory counts
  features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  s1 = CompositeId.encode(features);
  data = {
    limit: 10,
    offset: 0,
    s1,
  };
  response = await client.fetch('/studies/byCentreline', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.length).toBe(6);

  // valid feature with less than maxPerCategory counts, filter by type
  features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  s1 = CompositeId.encode(features);
  data = {
    limit: 10,
    offset: 0,
    s1,
    studyTypes: [StudyType.ATR_SPEED_VOLUME],
  };
  response = await client.fetch('/studies/byCentreline', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.length).toBe(2);

  // valid feature with less than maxPerCategory counts, date range filters to empty
  dateRangeStart = DateTime.fromObject({ year: 2018, month: 1, day: 1 });
  dateRangeEnd = DateTime.fromObject({ year: 2019, month: 1, day: 1 });
  features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  s1 = CompositeId.encode(features);
  data = {
    dateRangeEnd,
    dateRangeStart,
    limit: 10,
    offset: 0,
    s1,
  };
  response = await client.fetch('/studies/byCentreline', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.length).toBe(0);

  // valid feature with more than maxPerCategory counts
  features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  s1 = CompositeId.encode(features);
  data = {
    limit: 10,
    offset: 0,
    s1,
  };
  response = await client.fetch('/studies/byCentreline', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.length).toBe(10);
});

test('StudyController.getStudiesByCentreline [pagination]', async () => {
  const dateRangeStart = DateTime.fromObject({ year: 2015, month: 1, day: 1 });
  const dateRangeEnd = DateTime.fromObject({ year: 2018, month: 1, day: 1 });
  let features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  let s1 = CompositeId.encode(features);
  let data = {
    dateRangeEnd,
    dateRangeStart,
    s1,
    studyTypes: [StudyType.RESCU],
  };
  let response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);

  const { numPerCategory } = response.result[0];
  for (let offset = 0; offset < numPerCategory; offset += 100) {
    features = [
      { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
    ];
    s1 = CompositeId.encode(features);
    data = {
      dateRangeEnd,
      dateRangeStart,
      s1,
      studyTypes: [StudyType.RESCU],
      limit: 100,
      offset,
    };
    /* eslint-disable-next-line no-await-in-loop */
    response = await client.fetch('/studies/byCentreline', { data });
    expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
    const expectedLength = Math.min(100, numPerCategory - offset);
    expect(response.result).toHaveLength(expectedLength);
  }
});

test('StudyController.getStudiesByCentrelineSummary', async () => {
  // empty date range (start > end): returns empty results
  let dateRangeStart = DateTime.fromObject({ year: 2018, month: 1, day: 1 });
  let dateRangeEnd = DateTime.fromObject({ year: 2017, month: 12, day: 31 });
  let features = [
    { centrelineId: 30000549, centrelineType: CentrelineType.INTERSECTION },
  ];
  let s1 = CompositeId.encode(features);
  let data = {
    dateRangeEnd,
    dateRangeStart,
    studyTypes: [StudyType.TMC],
    s1,
  };
  let response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerCategoryStudy(response.result, []);

  // centreline feature with no counts
  features = [
    { centrelineId: 30062737, centrelineType: CentrelineType.SEGMENT },
  ];
  s1 = CompositeId.encode(features);
  data = { s1 };
  response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerCategoryStudy(response.result, []);

  // centreline feature with some counts
  features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  s1 = CompositeId.encode(features);
  data = { s1 };
  response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerCategoryStudy(response.result, [[4, 'ATR_VOLUME'], [2, 'ATR_SPEED_VOLUME']]);

  // valid feature with some counts, date range filters to empty
  dateRangeEnd = DateTime.fromObject({ year: 2019, month: 1, day: 1 });
  dateRangeStart = DateTime.fromObject({ year: 2018, month: 1, day: 1 });
  s1 = CompositeId.encode(features);
  data = {
    dateRangeEnd,
    dateRangeStart,
    s1,
  };
  response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerCategoryStudy(response.result, []);

  // centreline feature with lots of counts
  features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  s1 = CompositeId.encode(features);
  data = { s1 };
  response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerCategoryStudy(response.result, [[3633, 'RESCU'], [2, 'TMC']]);

  // centreline feature with lots of counts, date range filters to empty
  dateRangeEnd = DateTime.fromObject({ year: 1980, month: 1, day: 2 });
  dateRangeStart = DateTime.fromObject({ year: 1980, month: 1, day: 1 });
  features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  s1 = CompositeId.encode(features);
  data = {
    dateRangeEnd,
    dateRangeStart,
    s1,
  };
  response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerCategoryStudy(response.result, []);

  // centreline feature with lots of counts, date range filters down
  dateRangeEnd = DateTime.fromObject({ year: 2016, month: 1, day: 1 });
  dateRangeStart = DateTime.fromObject({ year: 2015, month: 1, day: 1 });
  features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  s1 = CompositeId.encode(features);
  data = {
    dateRangeEnd,
    dateRangeStart,
    s1,
  };
  response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerCategoryStudy(response.result, [[187, 'RESCU']]);

  // centreline feature with more than one kind of count
  features = [
    { centrelineId: 9278884, centrelineType: CentrelineType.SEGMENT },
  ];
  s1 = CompositeId.encode(features);
  data = { s1 };
  response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerCategoryStudy(response.result, [[1, 'ATR_VOLUME'], [2, 'ATR_SPEED_VOLUME']]);
});

test('StudyController.getStudiesByCentrelineSummaryPerLocation', async () => {
  // empty date range (start > end): returns empty results
  let dateRangeStart = DateTime.fromObject({ year: 2018, month: 1, day: 1 });
  let dateRangeEnd = DateTime.fromObject({ year: 2017, month: 12, day: 31 });
  let features = [
    { centrelineId: 30000549, centrelineType: CentrelineType.INTERSECTION },
  ];
  let s1 = CompositeId.encode(features);
  let data = {
    dateRangeEnd,
    dateRangeStart,
    studyTypes: [StudyType.TMC],
    s1,
  };
  let response = await client.fetch('/studies/byCentreline/summaryPerLocation', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerCategoryAndLocationStudy(response.result, []);

  // centreline feature with no counts
  features = [
    { centrelineId: 30062737, centrelineType: CentrelineType.SEGMENT },
  ];
  s1 = CompositeId.encode(features);
  data = { s1 };
  response = await client.fetch('/studies/byCentreline/summaryPerLocation', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerCategoryAndLocationStudy(response.result, []);

  // centreline feature with some counts
  features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  s1 = CompositeId.encode(features);
  data = { s1 };
  response = await client.fetch('/studies/byCentreline/summaryPerLocation', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerCategoryAndLocationStudy(
    response.result,
    [[[4], 'ATR_VOLUME'], [[2], 'ATR_SPEED_VOLUME']],
  );

  // valid feature with some counts, date range filters to empty
  dateRangeEnd = DateTime.fromObject({ year: 2019, month: 1, day: 1 });
  dateRangeStart = DateTime.fromObject({ year: 2018, month: 1, day: 1 });
  s1 = CompositeId.encode(features);
  data = {
    dateRangeEnd,
    dateRangeStart,
    s1,
  };
  response = await client.fetch('/studies/byCentreline/summaryPerLocation', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerCategoryAndLocationStudy(response.result, []);

  // centreline feature with lots of counts
  features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  s1 = CompositeId.encode(features);
  data = { s1 };
  response = await client.fetch('/studies/byCentreline/summaryPerLocation', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerCategoryAndLocationStudy(response.result, [[[3633], 'RESCU'], [[2], 'TMC']]);

  // centreline feature with lots of counts, date range filters to empty
  dateRangeEnd = DateTime.fromObject({ year: 1980, month: 1, day: 2 });
  dateRangeStart = DateTime.fromObject({ year: 1980, month: 1, day: 1 });
  features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  s1 = CompositeId.encode(features);
  data = {
    dateRangeEnd,
    dateRangeStart,
    s1,
  };
  response = await client.fetch('/studies/byCentreline/summaryPerLocation', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerCategoryAndLocationStudy(response.result, []);

  // centreline feature with lots of counts, date range filters down
  dateRangeEnd = DateTime.fromObject({ year: 2016, month: 1, day: 1 });
  dateRangeStart = DateTime.fromObject({ year: 2015, month: 1, day: 1 });
  features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  s1 = CompositeId.encode(features);
  data = {
    dateRangeEnd,
    dateRangeStart,
    s1,
  };
  response = await client.fetch('/studies/byCentreline/summaryPerLocation', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerCategoryAndLocationStudy(response.result, [[[187], 'RESCU']]);

  // centreline feature with more than one kind of count
  features = [
    { centrelineId: 9278884, centrelineType: CentrelineType.SEGMENT },
  ];
  s1 = CompositeId.encode(features);
  data = { s1 };
  response = await client.fetch('/studies/byCentreline/summaryPerLocation', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerCategoryAndLocationStudy(
    response.result,
    [[[1], 'ATR_VOLUME'], [[2], 'ATR_SPEED_VOLUME']],
  );
});

test('StudyController.getStudiesByCentrelineTotal', async () => {
  // centreline feature with no counts
  let features = [
    { centrelineId: 30062737, centrelineType: CentrelineType.SEGMENT },
  ];
  let s1 = CompositeId.encode(features);
  let data = { s1 };
  let response = await client.fetch('/studies/byCentreline/total', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.total).toBe(0);

  // centreline feature with some counts
  features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  s1 = CompositeId.encode(features);
  data = { s1 };
  response = await client.fetch('/studies/byCentreline/total', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.total).toBe(6);

  // centreline feature with lots of counts
  features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  s1 = CompositeId.encode(features);
  data = { s1 };
  response = await client.fetch('/studies/byCentreline/total', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.total).toBe(3635);

  // centreline feature with more than one kind of count
  features = [
    { centrelineId: 9278884, centrelineType: CentrelineType.SEGMENT },
  ];
  s1 = CompositeId.encode(features);
  data = { s1 };
  response = await client.fetch('/studies/byCentreline/total', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.total).toBe(3);
});
