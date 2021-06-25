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

function expectNumPerStudyTypeStudy(actual, expected) {
  expect(actual).toHaveLength(expected.length);
  expected.forEach(([n0, value0], i) => {
    const { n, studyType: { name: value } } = actual[i];
    expect(n).toBe(n0);
    expect(value).toBe(value0);
  });
}

function expectNumPerStudyTypeAndLocationStudy(actual, expected) {
  expect(actual).toHaveLength(expected.length);
  expected.forEach(([ns0, value0], i) => {
    const { perLocation, studyType: { name: value } } = actual[i];
    perLocation.forEach(({ n }, j) => {
      expect(n).toBe(ns0[j]);
    });
    expect(value).toBe(value0);
  });
}

test('StudyController.getStudiesByCentrelineSummary [invalid feature]', async () => {
  const features = [
    { centrelineId: 0, centrelineType: CentrelineType.INTERSECTION },
  ];
  const s1 = CompositeId.encode(features);
  const data = { s1 };
  const response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);
});

test('StudyController.getStudiesByCentrelineSummary [invalid date range]', async () => {
  const dateRangeStart = DateTime.fromObject({ year: 2018, month: 1, day: 1 });
  const dateRangeEnd = DateTime.fromObject({ year: 2017, month: 12, day: 31 });
  const features = [
    { centrelineId: 30000549, centrelineType: CentrelineType.INTERSECTION },
  ];
  const s1 = CompositeId.encode(features);
  const data = {
    dateRangeEnd,
    dateRangeStart,
    s1,
  };
  const response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toEqual([]);
});

test('StudyController.getStudiesByCentrelineSummary [valid feature, no studies]', async () => {
  const features = [
    { centrelineId: 30062737, centrelineType: CentrelineType.SEGMENT },
  ];
  const s1 = CompositeId.encode(features);
  const data = { s1 };
  const response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toEqual([]);
});

test('StudyController.getStudiesByCentrelineSummary [valid feature, some studies: ATR]', async () => {
  const features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  const s1 = CompositeId.encode(features);
  const data = { s1 };
  const response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerStudyTypeStudy(
    response.result,
    [[2, 'ATR_SPEED_VOLUME'], [4, 'ATR_VOLUME']],
  );
});

test('StudyController.getStudiesByCentrelineSummary [valid feature, some studies: TMC]', async () => {
  const features = [
    { centrelineId: 13446886, centrelineType: CentrelineType.INTERSECTION },
  ];
  const s1 = CompositeId.encode(features);
  const data = { s1 };
  const response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerStudyTypeStudy(response.result, [[6, 'TMC']]);
});

test('StudyController.getStudiesByCentrelineSummary [valid feature, date range filters to empty]', async () => {
  const dateRangeStart = DateTime.fromObject({ year: 2018, month: 1, day: 1 });
  const dateRangeEnd = DateTime.fromObject({ year: 2019, month: 1, day: 1 });
  const features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  const s1 = CompositeId.encode(features);
  const data = {
    dateRangeEnd,
    dateRangeStart,
    s1,
  };
  const response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toEqual([]);
});

test('StudyController.getStudiesByCentrelineSummary [valid feature, filter by type: ATR]', async () => {
  const features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  const s1 = CompositeId.encode(features);
  const data = {
    s1,
    studyTypes: [StudyType.ATR_SPEED_VOLUME],
  };
  const response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerStudyTypeStudy(response.result, [[2, 'ATR_SPEED_VOLUME']]);
});

test('StudyController.getStudiesByCentrelineSummary [valid feature, filter by type: TMC]', async () => {
  const features = [
    { centrelineId: 13446886, centrelineType: CentrelineType.INTERSECTION },
  ];
  const s1 = CompositeId.encode(features);
  const data = {
    s1,
    studyTypes: [StudyType.TMC],
  };
  const response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerStudyTypeStudy(response.result, [[6, 'TMC']]);
});

test('StudyController.getStudiesByCentrelineSummary [valid feature, filter Tue-Thu]', async () => {
  const features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  const s1 = CompositeId.encode(features);
  const data = {
    daysOfWeek: [2, 3, 4],
    s1,
  };
  const response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerStudyTypeStudy(response.result, [[2, 'ATR_SPEED_VOLUME'], [3, 'ATR_VOLUME']]);
});

test('StudyController.getStudiesByCentrelineSummary [valid feature, filter Fri-Mon]', async () => {
  const features = [
    { centrelineId: 13446886, centrelineType: CentrelineType.INTERSECTION },
  ];
  const s1 = CompositeId.encode(features);
  const data = {
    daysOfWeek: [0, 1, 5, 6],
    s1,
  };
  const response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerStudyTypeStudy(response.result, [[2, 'TMC']]);
});

test('StudyController.getStudiesByCentrelineSummary [valid feature, filter by date range]', async () => {
  const dateRangeStart = DateTime.fromObject({ year: 2011, month: 1, day: 1 });
  const dateRangeEnd = DateTime.fromObject({ year: 2019, month: 1, day: 1 });
  const features = [
    { centrelineId: 13446886, centrelineType: CentrelineType.INTERSECTION },
  ];
  const s1 = CompositeId.encode(features);
  const data = {
    dateRangeEnd,
    dateRangeStart,
    s1,
  };
  const response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerStudyTypeStudy(response.result, [[3, 'TMC']]);
});

test('StudyController.getStudiesByCentrelineSummary [valid feature, filter by study hours]', async () => {
  const features = [
    { centrelineId: 13446886, centrelineType: CentrelineType.INTERSECTION },
  ];
  const s1 = CompositeId.encode(features);
  const data = {
    hours: [StudyHours.SCHOOL],
    s1,
  };
  const response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerStudyTypeStudy(response.result, []);
});

test('StudyController.getStudiesByCentreline [invalid feature]', async () => {
  const features = [
    { centrelineId: 0, centrelineType: CentrelineType.INTERSECTION },
  ];
  const s1 = CompositeId.encode(features);
  const data = {
    limit: 10,
    offset: 0,
    s1,
  };
  const response = await client.fetch('/studies/byCentreline', { data });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);
});

test('StudyController.getStudiesByCentreline [invalid date range]', async () => {
  const dateRangeStart = DateTime.fromObject({ year: 2018, month: 1, day: 1 });
  const dateRangeEnd = DateTime.fromObject({ year: 2017, month: 12, day: 31 });
  const features = [
    { centrelineId: 30000549, centrelineType: CentrelineType.INTERSECTION },
  ];
  const s1 = CompositeId.encode(features);
  const data = {
    dateRangeEnd,
    dateRangeStart,
    limit: 10,
    offset: 0,
    s1,
  };
  const response = await client.fetch('/studies/byCentreline', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.length).toBe(0);
});

test('StudyController.getStudiesByCentreline [valid feature, no studies]', async () => {
  const features = [
    { centrelineId: 30062737, centrelineType: CentrelineType.SEGMENT },
  ];
  const s1 = CompositeId.encode(features);
  const data = {
    limit: 10,
    offset: 0,
    s1,
  };
  const response = await client.fetch('/studies/byCentreline', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.length).toBe(0);
});

test('StudyController.getStudiesByCentreline [valid feature, fewer than maxPerCategory]', async () => {
  const features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  const s1 = CompositeId.encode(features);
  const data = {
    limit: 10,
    offset: 0,
    s1,
  };
  const response = await client.fetch('/studies/byCentreline', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.length).toBe(6);
});

test('StudyController.getStudiesByCentreline [valid feature, filter by type: ATR]', async () => {
  const features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  const s1 = CompositeId.encode(features);
  const data = {
    limit: 10,
    offset: 0,
    s1,
    studyTypes: [StudyType.ATR_SPEED_VOLUME],
  };
  const response = await client.fetch('/studies/byCentreline', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.length).toBe(2);
});

test('StudyController.getStudiesByCentreline [valid feature, date range filters to empty]', async () => {
  const dateRangeStart = DateTime.fromObject({ year: 2018, month: 1, day: 1 });
  const dateRangeEnd = DateTime.fromObject({ year: 2019, month: 1, day: 1 });
  const features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  const s1 = CompositeId.encode(features);
  const data = {
    dateRangeEnd,
    dateRangeStart,
    limit: 10,
    offset: 0,
    s1,
  };
  const response = await client.fetch('/studies/byCentreline', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.length).toBe(0);
});

test('StudyController.getStudiesByCentreline [valid feature, more than maxPerCategory]', async () => {
  const features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  const s1 = CompositeId.encode(features);
  const data = {
    limit: 10,
    offset: 0,
    s1,
  };
  const response = await client.fetch('/studies/byCentreline', { data });
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

test('StudyController.getStudiesByCentrelineSummary [invalid date range]', async () => {
  const dateRangeStart = DateTime.fromObject({ year: 2018, month: 1, day: 1 });
  const dateRangeEnd = DateTime.fromObject({ year: 2017, month: 12, day: 31 });
  const features = [
    { centrelineId: 30000549, centrelineType: CentrelineType.INTERSECTION },
  ];
  const s1 = CompositeId.encode(features);
  const data = {
    dateRangeEnd,
    dateRangeStart,
    studyTypes: [StudyType.TMC],
    s1,
  };
  const response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerStudyTypeStudy(response.result, []);
});

test('StudyController.getStudiesByCentrelineSummary [valid feature, no studies]', async () => {
  const features = [
    { centrelineId: 30062737, centrelineType: CentrelineType.SEGMENT },
  ];
  const s1 = CompositeId.encode(features);
  const data = { s1 };
  const response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerStudyTypeStudy(response.result, []);
});

test('StudyController.getStudiesByCentrelineSummary [valid feature, some studies]', async () => {
  const features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  const s1 = CompositeId.encode(features);
  const data = { s1 };
  const response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerStudyTypeStudy(response.result, [[2, 'ATR_SPEED_VOLUME'], [4, 'ATR_VOLUME']]);
});

test('StudyController.getStudiesByCentrelineSummary [valid feature, date range filters to empty]', async () => {
  const features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  const dateRangeEnd = DateTime.fromObject({ year: 2019, month: 1, day: 1 });
  const dateRangeStart = DateTime.fromObject({ year: 2018, month: 1, day: 1 });
  const s1 = CompositeId.encode(features);
  const data = {
    dateRangeEnd,
    dateRangeStart,
    s1,
  };
  const response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerStudyTypeStudy(response.result, []);
});

test('StudyController.getStudiesByCentrelineSummary [valid feature, lots of studies]', async () => {
  const features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  const s1 = CompositeId.encode(features);
  const data = { s1 };
  const response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerStudyTypeStudy(response.result, [[3, 'ATR_VOLUME'], [3633, 'RESCU'], [2, 'TMC']]);
});

test('StudyController.getStudiesByCentrelineSummary [valid feature, lots of studies, date range filters to empty]', async () => {
  const dateRangeEnd = DateTime.fromObject({ year: 1980, month: 1, day: 2 });
  const dateRangeStart = DateTime.fromObject({ year: 1980, month: 1, day: 1 });
  const features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  const s1 = CompositeId.encode(features);
  const data = {
    dateRangeEnd,
    dateRangeStart,
    s1,
  };
  const response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerStudyTypeStudy(response.result, []);
});

test('StudyController.getStudiesByCentrelineSummary [valid feature, date range filters to less]', async () => {
  const dateRangeEnd = DateTime.fromObject({ year: 2016, month: 1, day: 1 });
  const dateRangeStart = DateTime.fromObject({ year: 2015, month: 1, day: 1 });
  const features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  const s1 = CompositeId.encode(features);
  const data = {
    dateRangeEnd,
    dateRangeStart,
    s1,
  };
  const response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerStudyTypeStudy(response.result, [[187, 'RESCU']]);
});

test('StudyController.getStudiesByCentrelineSummary [valid feature, multiple study types]', async () => {
  const features = [
    { centrelineId: 9278884, centrelineType: CentrelineType.SEGMENT },
  ];
  const s1 = CompositeId.encode(features);
  const data = { s1 };
  const response = await client.fetch('/studies/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerStudyTypeStudy(response.result, [[2, 'ATR_SPEED_VOLUME'], [1, 'ATR_VOLUME']]);
});

test('StudyController.getStudiesByCentrelineSummaryPerLocation [invalid date range]', async () => {
  const dateRangeStart = DateTime.fromObject({ year: 2018, month: 1, day: 1 });
  const dateRangeEnd = DateTime.fromObject({ year: 2017, month: 12, day: 31 });
  const features = [
    { centrelineId: 30000549, centrelineType: CentrelineType.INTERSECTION },
  ];
  const s1 = CompositeId.encode(features);
  const data = {
    dateRangeEnd,
    dateRangeStart,
    studyTypes: [StudyType.TMC],
    s1,
  };
  const response = await client.fetch('/studies/byCentreline/summaryPerLocation', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerStudyTypeAndLocationStudy(response.result, []);
});

test('StudyController.getStudiesByCentrelineSummaryPerLocation [valid feature, no studies]', async () => {
  const features = [
    { centrelineId: 30062737, centrelineType: CentrelineType.SEGMENT },
  ];
  const s1 = CompositeId.encode(features);
  const data = { s1 };
  const response = await client.fetch('/studies/byCentreline/summaryPerLocation', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerStudyTypeAndLocationStudy(response.result, []);
});

test('StudyController.getStudiesByCentrelineSummaryPerLocation [valid feature, some studies]', async () => {
  const features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  const s1 = CompositeId.encode(features);
  const data = { s1 };
  const response = await client.fetch('/studies/byCentreline/summaryPerLocation', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerStudyTypeAndLocationStudy(
    response.result,
    [[[2], 'ATR_SPEED_VOLUME'], [[4], 'ATR_VOLUME']],
  );
});

test('StudyController.getStudiesByCentrelineSummaryPerLocation [valid feature, date range filters to empty]', async () => {
  const features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  const dateRangeEnd = DateTime.fromObject({ year: 2019, month: 1, day: 1 });
  const dateRangeStart = DateTime.fromObject({ year: 2018, month: 1, day: 1 });
  const s1 = CompositeId.encode(features);
  const data = {
    dateRangeEnd,
    dateRangeStart,
    s1,
  };
  const response = await client.fetch('/studies/byCentreline/summaryPerLocation', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerStudyTypeAndLocationStudy(response.result, []);
});

test('StudyController.getStudiesByCentrelineSummaryPerLocation [valid feature, lots of studies]', async () => {
  const features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  const s1 = CompositeId.encode(features);
  const data = { s1 };
  const response = await client.fetch('/studies/byCentreline/summaryPerLocation', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerStudyTypeAndLocationStudy(response.result, [[[3], 'ATR_VOLUME'], [[3633], 'RESCU'], [[2], 'TMC']]);
});

test('StudyController.getStudiesByCentrelineSummaryPerLocation [valid feature, lots of studies, date range filters to empty]', async () => {
  const dateRangeEnd = DateTime.fromObject({ year: 1980, month: 1, day: 2 });
  const dateRangeStart = DateTime.fromObject({ year: 1980, month: 1, day: 1 });
  const features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  const s1 = CompositeId.encode(features);
  const data = {
    dateRangeEnd,
    dateRangeStart,
    s1,
  };
  const response = await client.fetch('/studies/byCentreline/summaryPerLocation', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerStudyTypeAndLocationStudy(response.result, []);
});

test('StudyController.getStudiesByCentrelineSummaryPerLocation [valid feature, date range filters to less]', async () => {
  const dateRangeEnd = DateTime.fromObject({ year: 2016, month: 1, day: 1 });
  const dateRangeStart = DateTime.fromObject({ year: 2015, month: 1, day: 1 });
  const features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  const s1 = CompositeId.encode(features);
  const data = {
    dateRangeEnd,
    dateRangeStart,
    s1,
  };
  const response = await client.fetch('/studies/byCentreline/summaryPerLocation', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerStudyTypeAndLocationStudy(response.result, [[[187], 'RESCU']]);
});

test('StudyController.getStudiesByCentrelineSummaryPerLocation [valid feature, multiple study types]', async () => {
  const features = [
    { centrelineId: 9278884, centrelineType: CentrelineType.SEGMENT },
  ];
  const s1 = CompositeId.encode(features);
  const data = { s1 };
  const response = await client.fetch('/studies/byCentreline/summaryPerLocation', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectNumPerStudyTypeAndLocationStudy(
    response.result,
    [[[2], 'ATR_SPEED_VOLUME'], [[1], 'ATR_VOLUME']],
  );
});

test('StudyController.getStudiesByCentrelineTotal [valid feature, no studies]', async () => {
  const features = [
    { centrelineId: 30062737, centrelineType: CentrelineType.SEGMENT },
  ];
  const s1 = CompositeId.encode(features);
  const data = { s1 };
  const response = await client.fetch('/studies/byCentreline/total', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.total).toBe(0);
});

test('StudyController.getStudiesByCentrelineTotal [valid feature, some studies]', async () => {
  const features = [
    { centrelineId: 14659630, centrelineType: CentrelineType.SEGMENT },
  ];
  const s1 = CompositeId.encode(features);
  const data = { s1 };
  const response = await client.fetch('/studies/byCentreline/total', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.total).toBe(6);
});

test('StudyController.getStudiesByCentrelineTotal [valid feature, lots of studies]', async () => {
  const features = [
    { centrelineId: 1145768, centrelineType: CentrelineType.SEGMENT },
  ];
  const s1 = CompositeId.encode(features);
  const data = { s1 };
  const response = await client.fetch('/studies/byCentreline/total', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.total).toBeGreaterThanOrEqual(3635);
});

test('StudyController.getStudiesByCentrelineTotal [valid feature, multiple study types]', async () => {
  const features = [
    { centrelineId: 9278884, centrelineType: CentrelineType.SEGMENT },
  ];
  const s1 = CompositeId.encode(features);
  const data = { s1 };
  const response = await client.fetch('/studies/byCentreline/total', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.total).toBe(3);
});
