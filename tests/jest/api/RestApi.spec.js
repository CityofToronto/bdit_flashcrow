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

class InjectBackendClient extends BackendClient {
  constructor(server) {
    super('');
    this.server = server;
    this.user = null;
  }

  getInjectOptions(apiUrl, apiOptions) {
    const {
      body,
      credentials,
      headers,
      method,
    } = apiOptions;
    const injectOptions = {
      headers,
      method,
      url: apiUrl,
    };
    if (body !== undefined) {
      injectOptions.payload = body;
    }
    if (credentials === 'include' && this.user !== null) {
      injectOptions.auth = {
        strategy: 'session',
        credentials: this.user,
      };
    }
    return injectOptions;
  }

  setUser(user) {
    this.user = user;
  }

  static async handleResponse(response) {
    return response;
  }

  async fetch(url, options) {
    const apiOptions = BackendClient.getFetchOptions(options);
    const apiUrl = this.getFetchUrl(url, apiOptions);
    const injectOptions = this.getInjectOptions(apiUrl, apiOptions);
    const response = await this.server.inject(injectOptions);
    return response;
  }
}

let server;
let client;

beforeAll(async () => {
  await DAOTestUtils.startupWithDevData();
  server = await initialize();
  client = new InjectBackendClient(server);
}, DAOTestUtils.TIMEOUT);
afterAll(async () => {
  await server.stop();
  await DAOTestUtils.shutdown();
}, DAOTestUtils.TIMEOUT);

test('AuthController.getAuth', async () => {
  let response = await client.fetch('/auth');
  expect(response.result).toEqual({
    csrf: response.result.csrf,
    loggedIn: false,
    user: null,
  });

  const transientUser = generateUser();
  const persistedUser = await UserDAO.create(transientUser);
  client.setUser(persistedUser);
  response = await client.fetch('/auth');
  expect(response.result).toEqual({
    csrf: response.result.csrf,
    loggedIn: true,
    user: persistedUser,
  });
  client.setUser(null);
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
  let data = {
    centrelineId: -1,
    centrelineType: -1,
  };
  let response = await client.fetch('/counts/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);

  // invalid date range (start > end)
  let start = DateTime.fromObject({ year: 2018, month: 1, day: 1 });
  let end = DateTime.fromObject({ year: 2017, month: 12, day: 31 });
  data = {
    centrelineId: 30000549,
    centrelineType: CentrelineType.INTERSECTION,
    end,
    start,
  };
  response = await client.fetch('/counts/byCentreline/summary', { data });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);

  // centreline feature with no counts
  data = {
    centrelineId: 30062737,
    centrelineType: CentrelineType.SEGMENT,
  };
  response = await client.fetch('/counts/byCentreline/summary', { data });
  expect(response.result).toEqual([]);

  // centreline feature with some counts
  data = {
    centrelineId: 14659630,
    centrelineType: CentrelineType.SEGMENT,
  };
  response = await client.fetch('/counts/byCentreline/summary', { data });
  expectNumPerCategory(
    response.result,
    [[10, 'ATR_VOLUME'], [6, 'ATR_SPEED_VOLUME']],
  );

  // valid feature with some counts, date range filters to empty
  start = DateTime.fromObject({ year: 2018, month: 1, day: 1 });
  end = DateTime.fromObject({ year: 2019, month: 1, day: 1 });
  data = {
    centrelineId: 14659630,
    centrelineType: CentrelineType.SEGMENT,
    end,
    start,
  };
  response = await client.fetch('/counts/byCentreline/summary', { data });
  expect(response.result).toEqual([]);

  // valid feature with some counts, filter by type
  data = {
    centrelineId: 14659630,
    centrelineType: CentrelineType.SEGMENT,
    studyType: [StudyType.ATR_SPEED_VOLUME],
  };
  response = await client.fetch('/counts/byCentreline/summary', { data });
  expectNumPerCategory(response.result, [[6, 'ATR_SPEED_VOLUME']]);

  // valid feature with some counts, filter by day of week
  data = {
    centrelineId: 14659630,
    centrelineType: CentrelineType.SEGMENT,
    dayOfWeek: [2, 3, 4],
  };
  response = await client.fetch('/counts/byCentreline/summary', { data });
  expectNumPerCategory(response.result, [[9, 'ATR_VOLUME'], [6, 'ATR_SPEED_VOLUME']]);

  // valid feature with some counts, filter by day of week
  data = {
    centrelineId: 14659630,
    centrelineType: CentrelineType.SEGMENT,
    dayOfWeek: [2, 3, 4],
  };
  response = await client.fetch('/counts/byCentreline/summary', { data });
  expectNumPerCategory(response.result, [[9, 'ATR_VOLUME'], [6, 'ATR_SPEED_VOLUME']]);

  // intersection with some counts
  data = {
    centrelineId: 13446886,
    centrelineType: CentrelineType.INTERSECTION,
  };
  response = await client.fetch('/counts/byCentreline/summary', { data });
  expectNumPerCategory(response.result, [[3, 'TMC']]);

  // intersection with some counts, filter by date
  start = DateTime.fromObject({ year: 2011, month: 1, day: 1 });
  end = DateTime.fromObject({ year: 2019, month: 1, day: 1 });
  data = {
    centrelineId: 13446886,
    centrelineType: CentrelineType.INTERSECTION,
    end,
    start,
  };
  response = await client.fetch('/counts/byCentreline/summary', { data });
  expectNumPerCategory(response.result, [[2, 'TMC']]);

  // intersection with some counts, filter by study hours
  data = {
    centrelineId: 13446886,
    centrelineType: CentrelineType.INTERSECTION,
    hours: [StudyHours.SCHOOL],
  };
  response = await client.fetch('/counts/byCentreline/summary', { data });
  expectNumPerCategory(response.result, []);

  // intersection with some counts, filter by days of week
  data = {
    centrelineId: 13446886,
    centrelineType: CentrelineType.INTERSECTION,
    dayOfWeek: [0, 1, 5, 6],
  };
  response = await client.fetch('/counts/byCentreline/summary', { data });
  expectNumPerCategory(response.result, [[1, 'TMC']]);

  // intersection with some counts, filter by type of study
  data = {
    centrelineId: 13446886,
    centrelineType: CentrelineType.INTERSECTION,
    studyType: [StudyType.TMC],
  };
  response = await client.fetch('/counts/byCentreline/summary', { data });
  expectNumPerCategory(response.result, [[3, 'TMC']]);

  // intersection with some counts, filter by type of study (non-TMC)
  data = {
    centrelineId: 13446886,
    centrelineType: CentrelineType.INTERSECTION,
    studyType: [StudyType.ATR_SPEED_VOLUME],
  };
  response = await client.fetch('/counts/byCentreline/summary', { data });
  expectNumPerCategory(response.result, []);
});

test('CountController.getCountsByCentreline', async () => {
  // invalid feature
  let data = {
    centrelineId: -1,
    centrelineType: -1,
    limit: 10,
    offset: 0,
  };
  let response = await client.fetch('/counts/byCentreline/TMC', { data });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);

  // invalid date range (start > end)
  let start = DateTime.fromObject({ year: 2018, month: 1, day: 1 });
  let end = DateTime.fromObject({ year: 2017, month: 12, day: 31 });
  data = {
    centrelineId: 30000549,
    centrelineType: CentrelineType.INTERSECTION,
    end,
    limit: 10,
    offset: 0,
    start,
  };
  response = await client.fetch('/counts/byCentreline/TMC', { data });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);

  // centreline feature with no counts
  data = {
    centrelineId: 30062737,
    centrelineType: CentrelineType.SEGMENT,
    limit: 10,
    offset: 0,
  };
  response = await client.fetch('/counts/byCentreline/ATR_VOLUME', { data });
  expect(response.result.length).toBe(0);

  // valid feature with less than maxPerCategory counts
  data = {
    centrelineId: 14659630,
    centrelineType: CentrelineType.SEGMENT,
    limit: 10,
    offset: 0,
  };
  response = await client.fetch('/counts/byCentreline/ATR_SPEED_VOLUME', { data });
  expect(response.result.length).toBe(6);

  // valid feature with less than maxPerCategory counts, date range filters to empty
  start = DateTime.fromObject({ year: 2018, month: 1, day: 1 });
  end = DateTime.fromObject({ year: 2019, month: 1, day: 1 });
  data = {
    centrelineId: 14659630,
    centrelineType: CentrelineType.SEGMENT,
    end,
    limit: 10,
    offset: 0,
    start,
  };
  response = await client.fetch('/counts/byCentreline/ATR_SPEED_VOLUME', { data });
  expect(response.result.length).toBe(0);

  // valid feature with more than maxPerCategory counts
  data = {
    centrelineId: 1145768,
    centrelineType: CentrelineType.SEGMENT,
    limit: 10,
    offset: 0,
  };
  response = await client.fetch('/counts/byCentreline/RESCU', { data });
  expect(response.result.length).toBe(10);
});

test('CountController.getCountsByCentreline [pagination]', async () => {
  const start = DateTime.fromObject({ year: 2015, month: 1, day: 1 });
  const end = DateTime.fromObject({ year: 2018, month: 1, day: 1 });
  let data = {
    centrelineId: 1145768,
    centrelineType: CentrelineType.SEGMENT,
    end,
    start,
    studyType: [StudyType.RESCU],
  };
  let response = await client.fetch('/counts/byCentreline/summary', { data });

  const { numPerCategory } = response.result[0];
  for (let offset = 0; offset < numPerCategory; offset += 100) {
    data = {
      centrelineId: 1145768,
      centrelineType: CentrelineType.SEGMENT,
      end,
      limit: 100,
      offset,
      start,
    };
    /* eslint-disable-next-line no-await-in-loop */
    response = await client.fetch('/counts/byCentreline/RESCU', { data });
    const expectedLength = Math.min(100, numPerCategory - offset);
    expect(response.result).toHaveLength(expectedLength);
  }
});

test('LocationController.getLocationSuggestions', async () => {

});
