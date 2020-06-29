import {
  AuthScope,
  CentrelineType,
  HttpStatus,
  StudyHours,
  StudyRequestReason,
  StudyRequestStatus,
  StudyType,
} from '@/lib/Constants';
import UserDAO from '@/lib/db/UserDAO';
import CompositeId from '@/lib/io/CompositeId';
import AuthState from '@/lib/model/AuthState';
import InjectBackendClient from '@/lib/test/api/InjectBackendClient';
import { generateUser } from '@/lib/test/random/UserGenerator';
import DateTime from '@/lib/time/DateTime';
import { initialize } from '@/web/MoveServer';

let server;
let client;

beforeAll(async () => {
  server = await initialize();
  client = new InjectBackendClient(server);
}, 60000);
afterAll(async () => {
  await server.stop();
}, 60000);

test('AuthController.getAuth', async () => {
  let response = await client.fetch('/auth');
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toEqual({
    csrf: response.result.csrf,
    loggedIn: false,
    user: null,
  });
  await expect(
    AuthState.read.validateAsync(response.result),
  ).resolves.toEqual(response.result);

  const transientUser = generateUser();
  const persistedUser = await UserDAO.create(transientUser);
  client.setUser(persistedUser);
  response = await client.fetch('/auth');
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toEqual({
    csrf: response.result.csrf,
    loggedIn: true,
    user: persistedUser,
  });
  await expect(
    AuthState.read.validateAsync(response.result),
  ).resolves.toEqual(response.result);

  client.setUser(null);
});

function expectSuggestionsContain(result, centrelineId) {
  const suggestedIds = result.map(({ centrelineId: suggestedId }) => suggestedId);
  expect(suggestedIds).toContain(centrelineId);
}

test('LocationController.getLocationSuggestions', async () => {
  const data = {
    q: 'Danforth and Main',
    limit: 3,
  };
  const response = await client.fetch('/location/suggest', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.length).toBe(3);
  expectSuggestionsContain(response.result, 13460034);
});

test('LocationController.getLocationsByFeature', async () => {
  // empty list of features
  let data = {
    centrelineId: [],
    centrelineType: [],
  };
  let response = await client.fetch('/location/centreline', { data });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);

  // invalid feature
  data = {
    centrelineId: [-1],
    centrelineType: [-1],
  };
  response = await client.fetch('/location/centreline', { data });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);

  // valid multi-fetch
  data = {
    centrelineId: [30000549, 111569],
    centrelineType: [CentrelineType.INTERSECTION, CentrelineType.SEGMENT],
  };
  response = await client.fetch('/location/centreline', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.size).toBe(2);
});

function expectNumPerCategoryStudy(actual, expected) {
  expect(actual).toHaveLength(expected.length);
  expected.forEach(([n0, value0], i) => {
    const { category: { studyType: { name: value } }, n } = actual[i];
    expect(n).toBe(n0);
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

  // invalid date range (start > end)
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
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);

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

  // invalid date range (start > end)
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
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);

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

test('StudyRequestController', async () => {
  // `GET /auth` to force generation of CSRF token
  client.setUser(null);
  let response = await client.fetch('/auth');
  expect(client.csrf).not.toBeNull();

  // requester can create requests and edit their own requests
  const transientRequester = generateUser([
    AuthScope.STUDY_REQUESTS,
    AuthScope.STUDY_REQUESTS_EDIT,
  ]);
  const requester = await UserDAO.create(transientRequester);

  // supervisors can manage all requests
  const transientSupervisor = generateUser([
    AuthScope.STUDY_REQUESTS,
    AuthScope.STUDY_REQUESTS_ADMIN,
    AuthScope.STUDY_REQUESTS_EDIT,
  ]);
  const supervisor = await UserDAO.create(transientSupervisor);

  // other ETT1s have edit powers, but only on their own requests
  const transientETT1 = generateUser([
    AuthScope.STUDY_REQUESTS,
    AuthScope.STUDY_REQUESTS_EDIT,
  ]);
  const ett1 = await UserDAO.create(transientETT1);

  // other staff can only view requests; they cannot create or edit them
  const transientStaff = generateUser([
    AuthScope.STUDY_REQUESTS,
  ]);
  const staff = await UserDAO.create(transientStaff);

  const now = DateTime.local();
  const transientStudyRequest = {
    serviceRequestId: null,
    urgent: false,
    urgentReason: null,
    assignedTo: null,
    dueDate: now.plus({ months: 3 }),
    estimatedDeliveryDate: now.plus({ months: 2, weeks: 3 }),
    reasons: [StudyRequestReason.TSC, StudyRequestReason.PED_SAFETY],
    ccEmails: [],
    studyType: StudyType.TMC,
    daysOfWeek: [2, 3, 4],
    duration: null,
    hours: StudyHours.ROUTINE,
    notes: 'completely normal routine turning movement count',
    centrelineId: 13459445,
    centrelineType: CentrelineType.INTERSECTION,
    geom: {
      type: 'Point',
      coordinates: [-79.333251, 43.709012],
    },
  };
  const features = [
    { centrelineId: 13459445, centrelineType: CentrelineType.INTERSECTION },
  ];
  const s1 = CompositeId.encode(features);

  // creating requests requires `STUDY_REQUESTS_EDIT` permission
  client.setUser(staff);
  response = await client.fetch('/requests/study', {
    method: 'POST',
    data: transientStudyRequest,
  });
  expect(response.statusCode).toBe(HttpStatus.FORBIDDEN.statusCode);

  // requester can create request
  client.setUser(requester);
  response = await client.fetch('/requests/study', {
    method: 'POST',
    data: transientStudyRequest,
  });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  let persistedStudyRequest = response.result;
  expect(persistedStudyRequest.id).not.toBeNull();
  expect(persistedStudyRequest.userId).toBe(requester.id);
  expect(persistedStudyRequest.status).toBe(StudyRequestStatus.REQUESTED);
  expect(persistedStudyRequest.closed).toBe(false);

  // cannot call `POST /requests/study` with a persisted study request instance
  response = await client.fetch('/requests/study', {
    method: 'POST',
    data: persistedStudyRequest,
  });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);

  // cannot fetch non-existent study request
  response = await client.fetch('/requests/study/1234567890');
  expect(response.statusCode).toBe(HttpStatus.NOT_FOUND.statusCode);

  // requester can fetch their own study request
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}`);
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  let fetchedStudyRequest = response.result;
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);

  // other ETT1s can fetch this study request
  client.setUser(ett1);
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}`);
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  fetchedStudyRequest = response.result;
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);

  // supervisors can fetch this study request
  client.setUser(supervisor);
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}`);
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  fetchedStudyRequest = response.result;
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);

  // requester can fetch by centreline pending
  const data = { s1 };
  client.setUser(requester);
  response = await client.fetch('/requests/study/byCentreline/pending', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  let fetchedStudyRequests = response.result;
  expect(fetchedStudyRequests).toContainEqual(persistedStudyRequest);

  // other ETT1s can fetch by centreline pending
  client.setUser(ett1);
  response = await client.fetch('/requests/study/byCentreline/pending', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  fetchedStudyRequests = response.result;
  expect(fetchedStudyRequests).toContainEqual(persistedStudyRequest);

  // supervisors can fetch by centreline pending
  client.setUser(supervisor);
  response = await client.fetch('/requests/study/byCentreline/pending', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  fetchedStudyRequests = response.result;
  expect(fetchedStudyRequests).toContainEqual(persistedStudyRequest);

  // requester can fetch all
  client.setUser(requester);
  response = await client.fetch('/requests/study');
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  fetchedStudyRequests = response.result;
  expect(fetchedStudyRequests).toContainEqual(persistedStudyRequest);

  // other ETT1s can fetch all
  client.setUser(ett1);
  response = await client.fetch('/requests/study');
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  fetchedStudyRequests = response.result;
  expect(fetchedStudyRequests).toContainEqual(persistedStudyRequest);

  // supervisors can fetch all
  client.setUser(supervisor);
  response = await client.fetch('/requests/study');
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  fetchedStudyRequests = response.result;
  expect(fetchedStudyRequests).toContainEqual(persistedStudyRequest);

  // update study request fields
  persistedStudyRequest.reasons = [StudyRequestReason.TSC];
  persistedStudyRequest.serviceRequestId = '12345';

  // cannot update non-existent study request
  client.setUser(requester);
  response = await client.fetch('/requests/study/1234567890', {
    method: 'PUT',
    data: persistedStudyRequest,
  });
  expect(response.statusCode).toBe(HttpStatus.NOT_FOUND.statusCode);

  // other ETT1s cannot update this request
  client.setUser(ett1);
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}`, {
    method: 'PUT',
    data: persistedStudyRequest,
  });
  expect(response.statusCode).toBe(HttpStatus.FORBIDDEN.statusCode);

  // cannot update a transient instance
  client.setUser(requester);
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}`, {
    method: 'PUT',
    data: transientStudyRequest,
  });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);

  // requester can update study request
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}`, {
    method: 'PUT',
    data: persistedStudyRequest,
  });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.studyRequest.id).toEqual(persistedStudyRequest.id);
  expect(response.result.studyRequestChange).toBeNull();
  persistedStudyRequest = response.result.studyRequest;

  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}`);
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  fetchedStudyRequest = response.result;
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);
  expect(fetchedStudyRequest.lastEditorId).toEqual(requester.id);

  // update more study request fields and set urgent
  persistedStudyRequest.daysOfWeek = [3, 4];
  persistedStudyRequest.hours = StudyHours.SCHOOL;
  persistedStudyRequest.notes = 'oops, this is actually a school count';
  persistedStudyRequest.urgent = true;
  persistedStudyRequest.urgentReason = 'because I said so';

  // supervisor can update study request
  client.setUser(supervisor);
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}`, {
    method: 'PUT',
    data: persistedStudyRequest,
  });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.studyRequestChange).toBeNull();
  persistedStudyRequest = response.result.studyRequest;

  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}`);
  fetchedStudyRequest = response.result;
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);
  expect(fetchedStudyRequest.lastEditorId).toEqual(supervisor.id);
});
