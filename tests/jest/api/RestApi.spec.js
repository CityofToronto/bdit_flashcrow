import {
  CentrelineType,
  HttpStatus,
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
});
