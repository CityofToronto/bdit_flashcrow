import {
  CentrelineType,
  HttpStatus,
  StudyHours,
  StudyType,
} from '@/lib/Constants';
import BackendClient from '@/lib/api/BackendClient';
import UserDAO from '@/lib/db/UserDAO';
import DAOTestUtils from '@/lib/test/DAOTestUtils';
import { generateUser } from '@/lib/test/random/UserGenerator';
import DateTime from '@/lib/time/DateTime';
import { initialize } from '@/web/MoveServer';

let server;

beforeAll(async () => {
  await DAOTestUtils.startupWithDevData();
  server = await initialize();
}, DAOTestUtils.TIMEOUT);
afterAll(async () => {
  await server.stop();
  await DAOTestUtils.shutdown();
}, DAOTestUtils.TIMEOUT);

test('AuthController.getAuth', async () => {
  let response = await server.inject({
    method: 'GET',
    url: '/auth',
  });
  expect(response.result).toEqual({
    csrf: response.result.csrf,
    loggedIn: false,
    user: null,
  });

  const transientUser = generateUser();
  const persistedUser = await UserDAO.create(transientUser);
  response = await server.inject({
    auth: {
      strategy: 'session',
      credentials: persistedUser,
    },
    method: 'GET',
    url: '/auth',
  });
  expect(response.result).toEqual({
    csrf: response.result.csrf,
    loggedIn: true,
    user: persistedUser,
  });
});

function expectNumPerCategory(actual, expected) {
  expect(actual).toHaveLength(expected.length);
  expected.forEach(([n0, value0], i) => {
    const { category: { studyType: { name: value } }, numPerCategory } = actual[i];
    expect(numPerCategory).toBe(n0);
    expect(value).toBe(value0);
  });
}

test('CountController.getCountsByCentrelineSummary', async () => {
  // invalid feature
  let params = {
    centrelineId: -1,
    centrelineType: -1,
  };
  let query = BackendClient.getQueryString(params);
  let response = await server.inject({
    method: 'GET',
    url: `/counts/byCentreline/summary?${query}`,
  });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);

  // invalid date range (start > end)
  let start = DateTime.fromObject({ year: 2018, month: 1, day: 1 });
  let end = DateTime.fromObject({ year: 2017, month: 12, day: 31 });
  params = {
    centrelineId: 30000549,
    centrelineType: CentrelineType.INTERSECTION,
    end,
    start,
  };
  query = BackendClient.getQueryString(params);
  response = await server.inject({
    method: 'GET',
    url: `/counts/byCentreline/summary?${query}`,
  });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);

  // centreline feature with no counts
  params = {
    centrelineId: 30062737,
    centrelineType: CentrelineType.SEGMENT,
  };
  query = BackendClient.getQueryString(params);
  response = await server.inject({
    method: 'GET',
    url: `/counts/byCentreline/summary?${query}`,
  });
  expect(response.result).toEqual([]);

  // centreline feature with some counts
  params = {
    centrelineId: 14659630,
    centrelineType: CentrelineType.SEGMENT,
  };
  query = BackendClient.getQueryString(params);
  response = await server.inject({
    method: 'GET',
    url: `/counts/byCentreline/summary?${query}`,
  });
  expectNumPerCategory(
    response.result,
    [[10, 'ATR_VOLUME'], [6, 'ATR_SPEED_VOLUME']],
  );

  // valid feature with some counts, date range filters to empty
  start = DateTime.fromObject({ year: 2018, month: 1, day: 1 });
  end = DateTime.fromObject({ year: 2019, month: 1, day: 1 });
  params = {
    centrelineId: 14659630,
    centrelineType: CentrelineType.SEGMENT,
    end,
    start,
  };
  query = BackendClient.getQueryString(params);
  response = await server.inject({
    method: 'GET',
    url: `/counts/byCentreline/summary?${query}`,
  });
  expect(response.result).toEqual([]);

  // valid feature with some counts, filter by type
  params = {
    centrelineId: 14659630,
    centrelineType: CentrelineType.SEGMENT,
    studyType: [StudyType.ATR_SPEED_VOLUME],
  };
  query = BackendClient.getQueryString(params);
  response = await server.inject({
    method: 'GET',
    url: `/counts/byCentreline/summary?${query}`,
  });
  expectNumPerCategory(response.result, [[6, 'ATR_SPEED_VOLUME']]);

  // valid feature with some counts, filter by day of week
  params = {
    centrelineId: 14659630,
    centrelineType: CentrelineType.SEGMENT,
    dayOfWeek: [2, 3, 4],
  };
  query = BackendClient.getQueryString(params);
  response = await server.inject({
    method: 'GET',
    url: `/counts/byCentreline/summary?${query}`,
  });
  expectNumPerCategory(response.result, [[9, 'ATR_VOLUME'], [6, 'ATR_SPEED_VOLUME']]);

  // valid feature with some counts, filter by day of week
  params = {
    centrelineId: 14659630,
    centrelineType: CentrelineType.SEGMENT,
    dayOfWeek: [2, 3, 4],
  };
  query = BackendClient.getQueryString(params);
  response = await server.inject({
    method: 'GET',
    url: `/counts/byCentreline/summary?${query}`,
  });
  expectNumPerCategory(response.result, [[9, 'ATR_VOLUME'], [6, 'ATR_SPEED_VOLUME']]);

  // intersection with some counts
  params = {
    centrelineId: 13446886,
    centrelineType: CentrelineType.INTERSECTION,
  };
  query = BackendClient.getQueryString(params);
  response = await server.inject({
    method: 'GET',
    url: `/counts/byCentreline/summary?${query}`,
  });
  expectNumPerCategory(response.result, [[3, 'TMC']]);

  // intersection with some counts, filter by date
  start = DateTime.fromObject({ year: 2011, month: 1, day: 1 });
  end = DateTime.fromObject({ year: 2019, month: 1, day: 1 });
  params = {
    centrelineId: 13446886,
    centrelineType: CentrelineType.INTERSECTION,
    end,
    start,
  };
  query = BackendClient.getQueryString(params);
  response = await server.inject({
    method: 'GET',
    url: `/counts/byCentreline/summary?${query}`,
  });
  expectNumPerCategory(response.result, [[2, 'TMC']]);

  // intersection with some counts, filter by study hours
  params = {
    centrelineId: 13446886,
    centrelineType: CentrelineType.INTERSECTION,
    hours: [StudyHours.SCHOOL],
  };
  query = BackendClient.getQueryString(params);
  response = await server.inject({
    method: 'GET',
    url: `/counts/byCentreline/summary?${query}`,
  });
  expectNumPerCategory(response.result, []);

  // intersection with some counts, filter by days of week
  params = {
    centrelineId: 13446886,
    centrelineType: CentrelineType.INTERSECTION,
    dayOfWeek: [0, 1, 5, 6],
  };
  query = BackendClient.getQueryString(params);
  response = await server.inject({
    method: 'GET',
    url: `/counts/byCentreline/summary?${query}`,
  });
  expectNumPerCategory(response.result, [[1, 'TMC']]);

  // intersection with some counts, filter by type of study
  params = {
    centrelineId: 13446886,
    centrelineType: CentrelineType.INTERSECTION,
    studyType: [StudyType.TMC],
  };
  query = BackendClient.getQueryString(params);
  response = await server.inject({
    method: 'GET',
    url: `/counts/byCentreline/summary?${query}`,
  });
  expectNumPerCategory(response.result, [[3, 'TMC']]);

  // intersection with some counts, filter by type of study (non-TMC)
  params = {
    centrelineId: 13446886,
    centrelineType: CentrelineType.INTERSECTION,
    studyType: [StudyType.ATR_SPEED_VOLUME],
  };
  query = BackendClient.getQueryString(params);
  response = await server.inject({
    method: 'GET',
    url: `/counts/byCentreline/summary?${query}`,
  });
  expectNumPerCategory(response.result, []);
});

test('CountController.getCountsByCentreline', async () => {
  // invalid feature
  let params = {
    centrelineId: -1,
    centrelineType: -1,
    limit: 10,
    offset: 0,
  };
  let query = BackendClient.getQueryString(params);
  let response = await server.inject({
    method: 'GET',
    url: `/counts/byCentreline/TMC?${query}`,
  });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);

  // invalid date range (start > end)
  let start = DateTime.fromObject({ year: 2018, month: 1, day: 1 });
  let end = DateTime.fromObject({ year: 2017, month: 12, day: 31 });
  params = {
    centrelineId: 30000549,
    centrelineType: CentrelineType.INTERSECTION,
    end,
    limit: 10,
    offset: 0,
    start,
  };
  query = BackendClient.getQueryString(params);
  response = await server.inject({
    method: 'GET',
    url: `/counts/byCentreline/TMC?${query}`,
  });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);

  // centreline feature with no counts
  params = {
    centrelineId: 30062737,
    centrelineType: CentrelineType.SEGMENT,
    limit: 10,
    offset: 0,
  };
  query = BackendClient.getQueryString(params);
  response = await server.inject({
    method: 'GET',
    url: `/counts/byCentreline/ATR_VOLUME?${query}`,
  });
  expect(response.result.length).toBe(0);

  // valid feature with less than maxPerCategory counts
  params = {
    centrelineId: 14659630,
    centrelineType: CentrelineType.SEGMENT,
    limit: 10,
    offset: 0,
  };
  query = BackendClient.getQueryString(params);
  response = await server.inject({
    method: 'GET',
    url: `/counts/byCentreline/ATR_SPEED_VOLUME?${query}`,
  });
  expect(response.result.length).toBe(6);

  // valid feature with less than maxPerCategory counts, date range filters to empty
  start = DateTime.fromObject({ year: 2018, month: 1, day: 1 });
  end = DateTime.fromObject({ year: 2019, month: 1, day: 1 });
  params = {
    centrelineId: 14659630,
    centrelineType: CentrelineType.SEGMENT,
    end,
    limit: 10,
    offset: 0,
    start,
  };
  query = BackendClient.getQueryString(params);
  response = await server.inject({
    method: 'GET',
    url: `/counts/byCentreline/ATR_SPEED_VOLUME?${query}`,
  });
  expect(response.result.length).toBe(0);

  // valid feature with more than maxPerCategory counts
  params = {
    centrelineId: 1145768,
    centrelineType: CentrelineType.SEGMENT,
    limit: 10,
    offset: 0,
  };
  query = BackendClient.getQueryString(params);
  response = await server.inject({
    method: 'GET',
    url: `/counts/byCentreline/RESCU?${query}`,
  });
  expect(response.result.length).toBe(10);
});

test('CountController.getCountsByCentreline [pagination]', async () => {
  const start = DateTime.fromObject({ year: 2015, month: 1, day: 1 });
  const end = DateTime.fromObject({ year: 2018, month: 1, day: 1 });
  let params = {
    centrelineId: 1145768,
    centrelineType: CentrelineType.SEGMENT,
    end,
    start,
    studyType: [StudyType.RESCU],
  };
  let query = BackendClient.getQueryString(params);
  let response = await server.inject({
    method: 'GET',
    url: `/counts/byCentreline/summary?${query}`,
  });

  const { numPerCategory } = response.result[0];
  for (let offset = 0; offset < numPerCategory; offset += 100) {
    params = {
      centrelineId: 1145768,
      centrelineType: CentrelineType.SEGMENT,
      end,
      limit: 100,
      offset,
      start,
    };
    query = BackendClient.getQueryString(params);
    /* eslint-disable-next-line no-await-in-loop */
    response = await server.inject({
      method: 'GET',
      url: `/counts/byCentreline/RESCU?${query}`,
    });
    const expectedLength = Math.min(100, numPerCategory - offset);
    expect(response.result).toHaveLength(expectedLength);
  }
});
