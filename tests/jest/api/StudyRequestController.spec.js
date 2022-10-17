import {
  AuthScope,
  HttpStatus,
  StudyHours,
  StudyRequestAssignee,
  StudyRequestReason,
  StudyRequestStatus,
  StudyType,
} from '@/lib/Constants';
import config from '@/lib/config/MoveConfig';
import db from '@/lib/db/db';
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import UserDAO from '@/lib/db/UserDAO';
import Mailer from '@/lib/email/Mailer';
import CompositeId from '@/lib/io/CompositeId';
import InjectBackendClient from '@/lib/test/api/InjectBackendClient';
import { generateStudyRequest } from '@/lib/test/random/StudyRequestGenerator';
import { generateUser } from '@/lib/test/random/UserGenerator';
import DateTime from '@/lib/time/DateTime';
import WebServer from '@/web/WebServer';
import StudyRequestBulkDAO from '@/lib/db/StudyRequestBulkDAO';
import StudyRequestItemDAO from '@/lib/db/StudyRequestItemDAO';

jest.mock('@/lib/db/CentrelineDAO');
jest.mock('@/lib/email/Mailer');
jest.mock('@/lib/db/StudyRequestBulkDAO');
jest.mock('@/lib/db/StudyRequestItemDAO');

let requester;
let supervisor;
let ett1;
let admin;

async function initUsers() {
  // requester can create requests and edit their own requests
  const transientRequester = generateUser([AuthScope.STUDY_REQUESTS]);
  requester = await UserDAO.create(transientRequester);

  // supervisors can manage all requests
  const transientSupervisor = generateUser([
    AuthScope.STUDY_REQUESTS,
    AuthScope.STUDY_REQUESTS_ADMIN,
  ]);
  supervisor = await UserDAO.create(transientSupervisor);

  // other ETT1s have edit powers, but only on their own requests
  const transientETT1 = generateUser([AuthScope.STUDY_REQUESTS]);
  ett1 = await UserDAO.create(transientETT1);

  admin = await UserDAO.create(generateUser([AuthScope.ADMIN]));
}

let server;
let client;

beforeAll(async () => {
  const webServer = new WebServer({ port: config.port });
  server = await webServer.initialize();
  client = new InjectBackendClient(server);

  await initUsers();
}, 60000);
afterAll(async () => {
  await server.stop();
  db.$pool.end();
}, 60000);

function mockDAOsForStudyRequest(studyRequest) {
  const { centrelineId, centrelineType, geom } = studyRequest;
  CentrelineDAO.byFeature.mockResolvedValue({
    centrelineId,
    centrelineType,
    description: 'Mocked location description',
    geom,
  });
}

test('StudyRequestController.postStudyRequest', async () => {
  const transientStudyRequest = generateStudyRequest();
  mockDAOsForStudyRequest(transientStudyRequest);
  Mailer.send.mockClear();

  client.setUser(requester);
  let response = await client.fetch('/requests/study', {
    method: 'POST',
    data: transientStudyRequest,
  });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(Mailer.send).toHaveBeenCalledTimes(2);
  const persistedStudyRequest = response.result;
  expect(persistedStudyRequest.id).not.toBeNull();
  expect(persistedStudyRequest.userId).toBe(requester.id);
  expect(persistedStudyRequest.status).toBe(StudyRequestStatus.REQUESTED);

  // cannot call `POST /requests/study` with a persisted study request instance
  response = await client.fetch('/requests/study', {
    method: 'POST',
    data: persistedStudyRequest,
  });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);
});

describe('putStudyRequestItems', () => {
  let user;
  let response;

  beforeEach(async () => {
    client.setUser(user);
    response = await client.fetch('/requests/study/items', {
      method: 'PUT',
    });
  });

  describe('when the user is NOT an admin', () => {
    beforeAll(() => { user = ett1; });
    test('returns status code 403', async () => {
      expect(response.statusCode).toBe(HttpStatus.FORBIDDEN.statusCode);
    });
  });

  describe('when the user is an admin', () => {
    beforeAll(() => {
      user = admin;
      const studyRequestProjects = [
        { id: 1, name: 'name1', notes: 'notes1' },
        { id: 2, name: 'name2', notes: 'notes2' },
        { id: 3, name: 'name3', notes: 'notes3' },
      ];
      StudyRequestBulkDAO.all.mockResolvedValue(studyRequestProjects);
    });
    test('passes all project ids to the SRI DAO bulk update', () => {
      expect(StudyRequestItemDAO.upsertByStudyRequestBulkIds).toHaveBeenCalledWith([1, 2, 3]);
    });
  });
});

test('StudyRequestController.getStudyRequest', async () => {
  const transientStudyRequest = generateStudyRequest();
  mockDAOsForStudyRequest(transientStudyRequest);

  client.setUser(requester);
  let response = await client.fetch('/requests/study', {
    method: 'POST',
    data: transientStudyRequest,
  });
  const persistedStudyRequest = response.result;

  // cannot fetch non-existent study request
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id + 1000}`);
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
});

test('StudyRequestController.getStudyRequestsByCentrelinePending', async () => {
  const transientStudyRequest = generateStudyRequest();
  mockDAOsForStudyRequest(transientStudyRequest);

  client.setUser(requester);
  let response = await client.fetch('/requests/study', {
    method: 'POST',
    data: transientStudyRequest,
  });
  const persistedStudyRequest = response.result;
  const s1 = CompositeId.encode([persistedStudyRequest]);

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
});

test('StudyRequestController.putStudyRequest', async () => {
  const transientStudyRequest = generateStudyRequest();
  mockDAOsForStudyRequest(transientStudyRequest);

  client.setUser(requester);
  let response = await client.fetch('/requests/study', {
    method: 'POST',
    data: transientStudyRequest,
  });
  let persistedStudyRequest = response.result;

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
  let fetchedStudyRequest = response.result;
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);

  // update more study request fields and set urgent
  persistedStudyRequest.ccEmails = ['Evan.Savage@toronto.ca'];
  persistedStudyRequest.daysOfWeek = [1, 3, 4, 5];
  persistedStudyRequest.studyType = StudyType.TMC;
  persistedStudyRequest.studyTypeOther = null;
  persistedStudyRequest.duration = null;
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
});

test('StudyRequestController.putStudyRequest [read-only fields]', async () => {
  const transientStudyRequest = generateStudyRequest();
  mockDAOsForStudyRequest(transientStudyRequest);

  client.setUser(requester);
  let response = await client.fetch('/requests/study', {
    method: 'POST',
    data: transientStudyRequest,
  });
  const persistedStudyRequest = response.result;

  // cannot change ID
  client.setUser(supervisor);
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}`, {
    method: 'PUT',
    data: {
      ...persistedStudyRequest,
      id: persistedStudyRequest.id + 1000,
    },
  });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);

  // cannot change createdAt
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}`, {
    method: 'PUT',
    data: {
      ...persistedStudyRequest,
      createdAt: DateTime.local().minus({ weeks: 3 }),
    },
  });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);
});

test('StudyRequestController.putStudyRequest [requester changes]', async () => {
  const transientStudyRequest = generateStudyRequest();
  mockDAOsForStudyRequest(transientStudyRequest);

  client.setUser(requester);
  let response = await client.fetch('/requests/study', {
    method: 'POST',
    data: transientStudyRequest,
  });
  let persistedStudyRequest = response.result;

  persistedStudyRequest.userId = ett1.id;

  // user without STUDY_REQUESTS_ADMIN cannot change requester ID
  client.setUser(requester);
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}`, {
    method: 'PUT',
    data: persistedStudyRequest,
  });
  expect(response.statusCode).toBe(HttpStatus.FORBIDDEN.statusCode);

  // user with STUDY_REQUESTS_ADMIN can change requester ID
  client.setUser(supervisor);
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}`, {
    method: 'PUT',
    data: persistedStudyRequest,
  });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  persistedStudyRequest = response.result;

  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}`);
  const fetchedStudyRequest = response.result;
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);
});

test('StudyRequestController.putStudyRequest [status changes]', async () => {
  const transientStudyRequest = generateStudyRequest();
  mockDAOsForStudyRequest(transientStudyRequest);

  client.setUser(requester);
  let response = await client.fetch('/requests/study', {
    method: 'POST',
    data: transientStudyRequest,
  });
  let persistedStudyRequest = response.result;

  // requester can cancel request
  Mailer.send.mockClear();
  persistedStudyRequest.status = StudyRequestStatus.CANCELLED;
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}`, {
    method: 'PUT',
    data: persistedStudyRequest,
  });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.id).toEqual(persistedStudyRequest.id);
  persistedStudyRequest = response.result;
  expect(Mailer.send).toHaveBeenCalledTimes(1);

  // requester can reopen request
  Mailer.send.mockClear();
  persistedStudyRequest.status = StudyRequestStatus.REQUESTED;
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}`, {
    method: 'PUT',
    data: persistedStudyRequest,
  });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.id).toEqual(persistedStudyRequest.id);
  persistedStudyRequest = response.result;
  expect(Mailer.send).toHaveBeenCalledTimes(0);

  // requester cannot request changes
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}`, {
    method: 'PUT',
    data: {
      ...persistedStudyRequest,
      status: StudyRequestStatus.CHANGES_NEEDED,
    },
  });
  expect(response.statusCode).toBe(HttpStatus.FORBIDDEN.statusCode);

  // supervisor can request changes
  Mailer.send.mockClear();
  client.setUser(supervisor);
  persistedStudyRequest.status = StudyRequestStatus.CHANGES_NEEDED;
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}`, {
    method: 'PUT',
    data: persistedStudyRequest,
  });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.id).toEqual(persistedStudyRequest.id);
  persistedStudyRequest = response.result;
  expect(Mailer.send).toHaveBeenCalledTimes(0);

  // requester cannot assign
  client.setUser(requester);
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}`, {
    method: 'PUT',
    data: {
      ...persistedStudyRequest,
      status: StudyRequestStatus.ASSIGNED,
      assignedTo: StudyRequestAssignee.FIELD_STAFF,
    },
  });
  expect(response.statusCode).toBe(HttpStatus.FORBIDDEN.statusCode);

  // supervisor can assign
  Mailer.send.mockClear();
  client.setUser(supervisor);
  persistedStudyRequest.status = StudyRequestStatus.ASSIGNED;
  persistedStudyRequest.assignedTo = StudyRequestAssignee.FIELD_STAFF;
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}`, {
    method: 'PUT',
    data: persistedStudyRequest,
  });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.id).toEqual(persistedStudyRequest.id);
  persistedStudyRequest = response.result;
  expect(Mailer.send).toHaveBeenCalledTimes(0);

  // requester cannot re-assign
  client.setUser(requester);
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}`, {
    method: 'PUT',
    data: {
      ...persistedStudyRequest,
      assignedTo: StudyRequestAssignee.OTI,
    },
  });
  expect(response.statusCode).toBe(HttpStatus.FORBIDDEN.statusCode);

  // supervisor can re-assign
  Mailer.send.mockClear();
  client.setUser(supervisor);
  persistedStudyRequest.assignedTo = StudyRequestAssignee.OTI;
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}`, {
    method: 'PUT',
    data: persistedStudyRequest,
  });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.id).toEqual(persistedStudyRequest.id);
  persistedStudyRequest = response.result;
  expect(Mailer.send).toHaveBeenCalledTimes(0);

  // requester cannot complete
  client.setUser(requester);
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}`, {
    method: 'PUT',
    data: {
      ...persistedStudyRequest,
      status: StudyRequestStatus.COMPLETED,
    },
  });
  expect(response.statusCode).toBe(HttpStatus.FORBIDDEN.statusCode);

  // supervisor can complete
  Mailer.send.mockClear();
  client.setUser(supervisor);
  persistedStudyRequest.status = StudyRequestStatus.COMPLETED;
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}`, {
    method: 'PUT',
    data: persistedStudyRequest,
  });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.id).toEqual(persistedStudyRequest.id);
  persistedStudyRequest = response.result;
  expect(Mailer.send).toHaveBeenCalledTimes(1);
});

function expectStudyRequestChanges(actual, expected) {
  expect(actual).toHaveLength(expected.length);
  expected.forEach((status, i) => {
    expect(actual[i].status).toBe(status);
  });
}

test('StudyRequestController.getStudyRequestChanges', async () => {
  const transientStudyRequest = generateStudyRequest();
  mockDAOsForStudyRequest(transientStudyRequest);

  client.setUser(requester);
  let response = await client.fetch('/requests/study', {
    method: 'POST',
    data: transientStudyRequest,
  });
  let persistedStudyRequest = response.result;

  // newly created study request has no changes
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}/changes`);
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectStudyRequestChanges(response.result, []);

  persistedStudyRequest.notes = 'testing study request changes';
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}`, {
    method: 'PUT',
    data: persistedStudyRequest,
  });
  persistedStudyRequest = response.result;

  // non-status-related changes are not logged in changes table
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}/changes`);
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectStudyRequestChanges(response.result, []);

  persistedStudyRequest.status = StudyRequestStatus.CANCELLED;
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}`, {
    method: 'PUT',
    data: persistedStudyRequest,
  });
  persistedStudyRequest = response.result;

  // status-related changes are logged in change table
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}/changes`);
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectStudyRequestChanges(response.result, [StudyRequestStatus.CANCELLED]);

  // other users can fetch changes as well
  client.setUser(ett1);
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}/changes`);
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectStudyRequestChanges(response.result, [StudyRequestStatus.CANCELLED]);

  client.setUser(requester);
  persistedStudyRequest.status = StudyRequestStatus.REQUESTED;
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}`, {
    method: 'PUT',
    data: persistedStudyRequest,
  });
  persistedStudyRequest = response.result;

  // changes are returned most recent first
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}/changes`);
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectStudyRequestChanges(response.result, [
    StudyRequestStatus.REQUESTED,
    StudyRequestStatus.CANCELLED,
  ]);

  client.setUser(supervisor);
  persistedStudyRequest.status = StudyRequestStatus.CHANGES_NEEDED;
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}`, {
    method: 'PUT',
    data: persistedStudyRequest,
  });
  persistedStudyRequest = response.result;

  persistedStudyRequest.status = StudyRequestStatus.ASSIGNED;
  persistedStudyRequest.assignedTo = StudyRequestAssignee.FIELD_STAFF;
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}`, {
    method: 'PUT',
    data: persistedStudyRequest,
  });
  persistedStudyRequest = response.result;

  persistedStudyRequest.assignedTo = StudyRequestAssignee.OTI;
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}`, {
    method: 'PUT',
    data: persistedStudyRequest,
  });
  persistedStudyRequest = response.result;

  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}/changes`);
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectStudyRequestChanges(response.result, [
    StudyRequestStatus.ASSIGNED,
    StudyRequestStatus.CHANGES_NEEDED,
    StudyRequestStatus.REQUESTED,
    StudyRequestStatus.CANCELLED,
  ]);
});

test('StudyRequestController [comments: post / get]', async () => {
  const transientStudyRequest = generateStudyRequest();
  mockDAOsForStudyRequest(transientStudyRequest);

  client.setUser(requester);
  let response = await client.fetch('/requests/study', {
    method: 'POST',
    data: transientStudyRequest,
  });
  let persistedStudyRequest = response.result;

  // users can comment on their own requests: counts as edit operation
  Mailer.send.mockClear();
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}/comments`, {
    method: 'POST',
    data: { comment: 'comment from requester' },
  });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  persistedStudyRequest = response.result.studyRequest;
  const persistedComment1 = response.result.studyRequestComment;
  expect(persistedComment1.userId).toBe(requester.id);
  expect(persistedComment1.studyRequestId).toBe(persistedStudyRequest.id);
  expect(Mailer.send).toHaveBeenCalledTimes(1);

  // getting comments
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}/comments`);
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toEqual([persistedComment1]);

  // other staff can comment on requests: also counts as edit operation
  client.setUser(ett1);
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}/comments`, {
    method: 'POST',
    data: { comment: 'comment from ETT1' },
  });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  persistedStudyRequest = response.result.studyRequest;
  const persistedComment2 = response.result.studyRequestComment;
  expect(persistedComment2.userId).toBe(ett1.id);
  expect(persistedComment2.studyRequestId).toBe(persistedStudyRequest.id);

  // getting comments: other staff can see all comments, newest first
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}/comments`);
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toEqual([persistedComment2, persistedComment1]);

  // supervisors can comment on requests: also counts as edit operation
  client.setUser(supervisor);
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}/comments`, {
    method: 'POST',
    data: { comment: 'comment from supervisor' },
  });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  persistedStudyRequest = response.result.studyRequest;
  const persistedComment3 = response.result.studyRequestComment;
  expect(persistedComment3.userId).toBe(supervisor.id);
  expect(persistedComment3.studyRequestId).toBe(persistedStudyRequest.id);

  // getting comments: supervisors can see all comments, newest first
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}/comments`);
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toEqual([persistedComment3, persistedComment2, persistedComment1]);
});

test('StudyRequestController [comments: put]', async () => {
  const transientStudyRequest = generateStudyRequest();
  mockDAOsForStudyRequest(transientStudyRequest);

  client.setUser(requester);
  let response = await client.fetch('/requests/study', {
    method: 'POST',
    data: transientStudyRequest,
  });
  let persistedStudyRequest = response.result;

  client.setUser(ett1);
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}/comments`, {
    method: 'POST',
    data: { comment: 'comment from ETT1' },
  });
  persistedStudyRequest = response.result.studyRequest;
  const persistedComment = response.result.studyRequestComment;

  // users can update their own comments
  const urlPutComment = `/requests/study/${persistedStudyRequest.id}/comments/${persistedComment.id}`;
  persistedComment.comment = 'comment from ETT1: now updated!';
  response = await client.fetch(urlPutComment, {
    method: 'PUT',
    data: persistedComment,
  });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  persistedStudyRequest = response.result.studyRequest;
  expect(response.result.studyRequestComment).toEqual(persistedComment);

  // users cannot update others' comments
  client.setUser(requester);
  response = await client.fetch(urlPutComment, {
    method: 'PUT',
    data: {
      ...persistedComment,
      comment: 'yeah, but this is *really* from the requester',
    },
  });
  expect(response.statusCode).toBe(HttpStatus.FORBIDDEN.statusCode);
});

test('StudyRequestController [comments: read-only fields]', async () => {
  const transientStudyRequest = generateStudyRequest();
  mockDAOsForStudyRequest(transientStudyRequest);

  client.setUser(requester);
  let response = await client.fetch('/requests/study', {
    method: 'POST',
    data: transientStudyRequest,
  });
  let persistedStudyRequest = response.result;

  client.setUser(ett1);
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}/comments`, {
    method: 'POST',
    data: { comment: 'comment from ETT1' },
  });
  persistedStudyRequest = response.result.studyRequest;
  const persistedComment = response.result.studyRequestComment;

  // cannot change ID
  const urlPutComment = `/requests/study/${persistedStudyRequest.id}/comments/${persistedComment.id}`;
  response = await client.fetch(urlPutComment, {
    method: 'PUT',
    data: {
      ...persistedComment,
      id: persistedComment.id + 1000,
    },
  });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);

  // cannot change createdAt timestamp
  response = await client.fetch(urlPutComment, {
    method: 'PUT',
    data: {
      ...persistedComment,
      createdAt: DateTime.local().minus({ weeks: 3 }),
    },
  });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);

  // cannot change commenter ID
  response = await client.fetch(urlPutComment, {
    method: 'PUT',
    data: {
      ...persistedComment,
      userId: requester.id,
    },
  });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);

  // cannot change study request ID
  response = await client.fetch(urlPutComment, {
    method: 'PUT',
    data: {
      ...persistedComment,
      studyRequestId: persistedStudyRequest.id + 1000,
    },
  });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);
});

test('StudyRequestController [comments: delete]', async () => {
  const transientStudyRequest = generateStudyRequest();
  mockDAOsForStudyRequest(transientStudyRequest);

  client.setUser(requester);
  let response = await client.fetch('/requests/study', {
    method: 'POST',
    data: transientStudyRequest,
  });
  let persistedStudyRequest = response.result;

  client.setUser(ett1);
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}/comments`, {
    method: 'POST',
    data: { comment: 'comment from ETT1' },
  });
  persistedStudyRequest = response.result.studyRequest;
  const persistedComment = response.result.studyRequestComment;

  // other users cannot delete comment
  client.setUser(supervisor);
  const urlDeleteComment = `/requests/study/${persistedStudyRequest.id}/comments/${persistedComment.id}`;
  response = await client.fetch(urlDeleteComment, {
    method: 'DELETE',
  });
  expect(response.statusCode).toBe(HttpStatus.FORBIDDEN.statusCode);

  // users can delete their own comments
  client.setUser(ett1);
  response = await client.fetch(urlDeleteComment, {
    method: 'DELETE',
  });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  persistedStudyRequest = response.result.studyRequest;
  expect(response.result.studyRequestComment.success).toBe(true);

  // deleting comment means there are no more comments
  response = await client.fetch(`/requests/study/${persistedStudyRequest.id}/comments`);
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toEqual([]);

  // users cannot delete non-existent comments
  response = await client.fetch(urlDeleteComment, {
    method: 'DELETE',
  });
  expect(response.statusCode).toBe(HttpStatus.NOT_FOUND.statusCode);
});
