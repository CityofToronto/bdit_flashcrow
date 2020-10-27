import {
  AuthScope,
  CentrelineType,
  HttpStatus,
  StudyHours,
  StudyRequestReason,
  StudyRequestStatus,
  StudyType,
} from '@/lib/Constants';
import config from '@/lib/config/MoveConfig';
import db from '@/lib/db/db';
import UserDAO from '@/lib/db/UserDAO';
import CompositeId from '@/lib/io/CompositeId';
import InjectBackendClient from '@/lib/test/api/InjectBackendClient';
import { generateUser } from '@/lib/test/random/UserGenerator';
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

test('StudyRequestController', async () => {
  // `GET /auth` to force generation of CSRF token
  client.setUser(null);
  let response = await client.fetch('/auth');
  expect(client.csrf).not.toBeNull();

  // requester can create requests and edit their own requests
  const transientRequester = generateUser([AuthScope.STUDY_REQUESTS]);
  const requester = await UserDAO.create(transientRequester);

  // supervisors can manage all requests
  const transientSupervisor = generateUser([
    AuthScope.STUDY_REQUESTS,
    AuthScope.STUDY_REQUESTS_ADMIN,
  ]);
  const supervisor = await UserDAO.create(transientSupervisor);

  // other ETT1s have edit powers, but only on their own requests
  const transientETT1 = generateUser([
    AuthScope.STUDY_REQUESTS,
  ]);
  const ett1 = await UserDAO.create(transientETT1);

  const now = DateTime.local();
  const transientStudyRequest = {
    urgent: false,
    urgentReason: null,
    dueDate: now.plus({ months: 3 }),
    estimatedDeliveryDate: now.plus({ months: 2, weeks: 3 }),
    reason: StudyRequestReason.PED_SAFETY,
    reasonOther: null,
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
  expect(fetchedStudyRequests.studyRequests).toContainEqual(persistedStudyRequest);

  // other ETT1s can fetch all
  client.setUser(ett1);
  response = await client.fetch('/requests/study');
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  fetchedStudyRequests = response.result;
  expect(fetchedStudyRequests.studyRequests).toContainEqual(persistedStudyRequest);

  // supervisors can fetch all
  client.setUser(supervisor);
  response = await client.fetch('/requests/study');
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  fetchedStudyRequests = response.result;
  expect(fetchedStudyRequests.studyRequests).toContainEqual(persistedStudyRequest);

  // update study request fields
  persistedStudyRequest.reason = StudyRequestReason.OTHER;
  persistedStudyRequest.reasonOther = 'not really sure, but it seemed good at the time';

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
  expect(response.result.id).toEqual(persistedStudyRequest.id);
  persistedStudyRequest = response.result;

  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}`);
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  fetchedStudyRequest = response.result;
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);
  expect(fetchedStudyRequest.lastEditorId).toEqual(requester.id);

  // update more study request fields and set urgent
  persistedStudyRequest.ccEmails = ['Evan.Savage@toronto.ca'];
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
  persistedStudyRequest = response.result;

  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}`);
  fetchedStudyRequest = response.result;
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);
  expect(fetchedStudyRequest.lastEditorId).toEqual(supervisor.id);
});
