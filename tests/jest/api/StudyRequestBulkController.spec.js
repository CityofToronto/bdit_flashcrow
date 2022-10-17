import { v4 as uuidv4 } from 'uuid';

import {
  AuthScope,
  HttpStatus,
  StudyRequestAssignee,
  StudyRequestStatus,
} from '@/lib/Constants';
import config from '@/lib/config/MoveConfig';
import db from '@/lib/db/db';
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import UserDAO from '@/lib/db/UserDAO';
import Mailer from '@/lib/email/Mailer';
import InjectBackendClient from '@/lib/test/api/InjectBackendClient';
import {
  generateStudyRequest,
  generateStudyRequestBulk,
} from '@/lib/test/random/StudyRequestGenerator';
import { generateUser } from '@/lib/test/random/UserGenerator';
import DateTime from '@/lib/time/DateTime';
import WebServer from '@/web/WebServer';

jest.mock('@/lib/db/CentrelineDAO');
jest.mock('@/lib/email/Mailer');

let requester;
let supervisor;
let ett1;

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

function mockDAOsForStudyRequestBulk(studyRequestBulk) {
  const { studyRequests } = studyRequestBulk;
  const resolvedValue = studyRequests.map(({ centrelineId, centrelineType }) => ({
    centrelineId,
    centrelineType,
    description: 'Mocked location description',
  }));
  CentrelineDAO.byFeatures.mockResolvedValue(resolvedValue);
}

test('StudyRequestBulkController.postStudyRequestBulk', async () => {
  const transientStudyRequestBulk = generateStudyRequestBulk();
  mockDAOsForStudyRequestBulk(transientStudyRequestBulk);
  Mailer.send.mockClear();

  client.setUser(requester);
  let response = await client.fetch('/requests/study/bulk', {
    method: 'POST',
    data: transientStudyRequestBulk,
  });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(Mailer.send).toHaveBeenCalledTimes(2);
  const persistedStudyRequestBulk = response.result;
  expect(persistedStudyRequestBulk.id).not.toBeNull();
  expect(persistedStudyRequestBulk.userId).toBe(requester.id);
  persistedStudyRequestBulk.studyRequests.forEach((studyRequest) => {
    expect(studyRequest.userId).toBe(requester.id);
    expect(studyRequest.studyRequestBulkId).toBe(persistedStudyRequestBulk.id);
  });

  // cannot call `POST /requests/study/bulk` with a persisted study request instance
  response = await client.fetch('/requests/study/bulk', {
    method: 'POST',
    data: persistedStudyRequestBulk,
  });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);
});

test('StudyRequestBulkController.postStudyRequestBulkFromRequests [adding standalone]', async () => {
  const TP = generateStudyRequestBulk();
  TP.studyRequests = [];
  mockDAOsForStudyRequestBulk(TP);

  client.setUser(requester);
  let response = await client.fetch('/requests/study', {
    method: 'POST',
    data: generateStudyRequest(),
  });
  const R1 = response.result;
  client.setUser(ett1);
  response = await client.fetch('/requests/study', {
    method: 'POST',
    data: generateStudyRequest(),
  });
  const R2 = response.result;

  Mailer.send.mockClear();
  client.setUser(supervisor);
  response = await client.fetch('/requests/study/bulk/fromRequests', {
    method: 'POST',
    data: {
      studyRequestBulk: TP,
      studyRequestIds: [R1.id, R2.id],
    },
  });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(Mailer.send).toHaveBeenCalledTimes(2);
  const P = response.result;
  R1.studyRequestBulkId = P.id;
  R2.studyRequestBulkId = P.id;
  expect(P.id).not.toBeNull();
  expect(P.userId).toBe(supervisor.id);
  expect(P.studyRequests).toEqual([R1, R2]);
});

test('StudyRequestBulkController.postStudyRequestBulkFromRequests [moving from existing project]', async () => {
  const TP1 = generateStudyRequestBulk();
  TP1.studyRequests = [];
  mockDAOsForStudyRequestBulk(TP1);

  const TP2 = generateStudyRequestBulk();
  mockDAOsForStudyRequestBulk(TP2);

  client.setUser(requester);
  let response = await client.fetch('/requests/study/bulk', {
    method: 'POST',
    data: TP2,
  });
  let P2 = response.result;
  let Rs2 = P2.studyRequests;

  Mailer.send.mockClear();
  client.setUser(supervisor);
  response = await client.fetch('/requests/study/bulk/fromRequests', {
    method: 'POST',
    data: {
      studyRequestBulk: TP1,
      studyRequestIds: Rs2.slice(1).map(({ id }) => id),
    },
  });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(Mailer.send).toHaveBeenCalledTimes(2);
  const P1 = response.result;
  Rs2 = Rs2.map((studyRequest, i) => {
    if (i === 0) {
      return studyRequest;
    }
    return {
      ...studyRequest,
      studyRequestBulkId: P1.id,
    };
  });
  expect(P1.userId).toBe(supervisor.id);
  expect(P1.studyRequests).toEqual(Rs2.slice(1));

  response = await client.fetch(`/requests/study/bulk/${P2.id}`, {
    method: 'GET',
  });
  P2 = response.result;
  expect(P2.userId).toBe(requester.id);
  expect(P2.studyRequests).toEqual([Rs2[0]]);
});

test.skip('StudyRequestBulkController.getStudyRequestBulk', async () => {
  const transientStudyRequestBulk = generateStudyRequestBulk();
  mockDAOsForStudyRequestBulk(transientStudyRequestBulk);

  client.setUser(requester);
  let response = await client.fetch('/requests/study/bulk', {
    method: 'POST',
    data: transientStudyRequestBulk,
  });
  const persistedStudyRequestBulk = response.result;

  // cannot fetch non-existent bulk study request
  response = await client.fetch(`/requests/study/${persistedStudyRequestBulk.id + 1000}`);
  expect(response.statusCode).toBe(HttpStatus.NOT_FOUND.statusCode);

  // requester can fetch their own study request
  response = await client.fetch(`/requests/study/bulk/${persistedStudyRequestBulk.id}`);
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  let fetchedStudyRequest = response.result;
  expect(fetchedStudyRequest).toEqual(persistedStudyRequestBulk);

  // other ETT1s can fetch this study request
  client.setUser(ett1);
  response = await client.fetch(`/requests/study/bulk/${persistedStudyRequestBulk.id}`);
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  fetchedStudyRequest = response.result;
  expect(fetchedStudyRequest).toEqual(persistedStudyRequestBulk);

  // supervisors can fetch this study request
  client.setUser(supervisor);
  response = await client.fetch(`/requests/study/bulk/${persistedStudyRequestBulk.id}`);
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  fetchedStudyRequest = response.result;
  expect(fetchedStudyRequest).toEqual(persistedStudyRequestBulk);
});

test('StudyRequestBulkController.getStudyRequestBulkName', async () => {
  const transientStudyRequestBulk = generateStudyRequestBulk();
  mockDAOsForStudyRequestBulk(transientStudyRequestBulk);

  client.setUser(requester);
  let response = await client.fetch('/requests/study/bulk', {
    method: 'POST',
    data: transientStudyRequestBulk,
  });
  const persistedStudyRequestBulk = response.result;

  // requester can fetch their own study request
  response = await client.fetch(`/requests/study/bulk/${persistedStudyRequestBulk.id}/name`);
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.name).toEqual(persistedStudyRequestBulk.name);

  // other ETT1s can fetch this study request
  client.setUser(ett1);
  response = await client.fetch(`/requests/study/bulk/${persistedStudyRequestBulk.id}/name`);
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.name).toEqual(persistedStudyRequestBulk.name);

  // supervisors can fetch this study request
  client.setUser(supervisor);
  response = await client.fetch(`/requests/study/bulk/${persistedStudyRequestBulk.id}/name`);
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.name).toEqual(persistedStudyRequestBulk.name);
});

test('StudyRequestBulkController.getStudyRequestsBulkSuggest', async () => {
  const TP = generateStudyRequestBulk();
  TP.name = uuidv4();
  mockDAOsForStudyRequestBulk(TP);

  client.setUser(requester);
  let response = await client.fetch('/requests/study/bulk', {
    method: 'POST',
    data: TP,
  });
  const P = response.result;

  // query not matching any projects
  client.setUser(requester);
  response = await client.fetch('/requests/study/bulk/suggest', {
    method: 'GET',
    data: {
      limit: 10,
      q: uuidv4(),
    },
  });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toEqual([]);

  // query matching P
  client.setUser(requester);
  response = await client.fetch('/requests/study/bulk/suggest', {
    method: 'GET',
    data: {
      limit: 10,
      q: P.name,
    },
  });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toContainEqual(P);

  // query matching P: partial match, different case
  client.setUser(requester);
  response = await client.fetch('/requests/study/bulk/suggest', {
    method: 'GET',
    data: {
      limit: 10,
      q: P.name.slice(9, 23).toUpperCase(),
    },
  });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toContainEqual(P);
});

test('StudyRequestBulkController.putStudyRequestBulk', async () => {
  const transientStudyRequestBulk = generateStudyRequestBulk();
  mockDAOsForStudyRequestBulk(transientStudyRequestBulk);

  client.setUser(requester);
  let response = await client.fetch('/requests/study/bulk', {
    method: 'POST',
    data: transientStudyRequestBulk,
  });
  let persistedStudyRequestBulk = response.result;

  // cannot update non-existent bulk study request
  client.setUser(requester);
  response = await client.fetch('/requests/study/bulk/1234567890', {
    method: 'PUT',
    data: persistedStudyRequestBulk,
  });
  expect(response.statusCode).toBe(HttpStatus.NOT_FOUND.statusCode);

  // other ETT1s cannot update this bulk request
  client.setUser(ett1);
  response = await client.fetch(`/requests/study/bulk/${persistedStudyRequestBulk.id}`, {
    method: 'PUT',
    data: persistedStudyRequestBulk,
  });
  expect(response.statusCode).toBe(HttpStatus.FORBIDDEN.statusCode);

  // cannot update a transient instance
  client.setUser(requester);
  response = await client.fetch(`/requests/study/bulk/${persistedStudyRequestBulk.id}`, {
    method: 'PUT',
    data: transientStudyRequestBulk,
  });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);

  // requester can update study request
  client.setUser(requester);
  response = await client.fetch(`/requests/study/bulk/${persistedStudyRequestBulk.id}`, {
    method: 'PUT',
    data: persistedStudyRequestBulk,
  });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.id).toEqual(persistedStudyRequestBulk.id);
  persistedStudyRequestBulk = response.result;

  response = await client.fetch(`/requests/study/bulk/${persistedStudyRequestBulk.id}`);
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  let fetchedStudyRequestBulk = response.result;
  expect(fetchedStudyRequestBulk).toEqual(persistedStudyRequestBulk);

  // get rid of ccEmails: supervisor can update
  persistedStudyRequestBulk.ccEmails = [];
  client.setUser(supervisor);
  response = await client.fetch(`/requests/study/bulk/${persistedStudyRequestBulk.id}`, {
    method: 'PUT',
    data: persistedStudyRequestBulk,
  });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.id).toEqual(persistedStudyRequestBulk.id);
  persistedStudyRequestBulk = response.result;

  response = await client.fetch(`/requests/study/bulk/${persistedStudyRequestBulk.id}`);
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  fetchedStudyRequestBulk = response.result;
  expect(fetchedStudyRequestBulk).toEqual(persistedStudyRequestBulk);

  // add ccEmails back: supervisor can update
  persistedStudyRequestBulk.ccEmails = ['Evan.Savage@toronto.ca'];
  client.setUser(supervisor);
  response = await client.fetch(`/requests/study/bulk/${persistedStudyRequestBulk.id}`, {
    method: 'PUT',
    data: persistedStudyRequestBulk,
  });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result.id).toEqual(persistedStudyRequestBulk.id);
  persistedStudyRequestBulk = response.result;

  response = await client.fetch(`/requests/study/bulk/${persistedStudyRequestBulk.id}`);
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  fetchedStudyRequestBulk = response.result;
  expect(fetchedStudyRequestBulk).toEqual(persistedStudyRequestBulk);
});

test('StudyRequestBulkController.putStudyRequestBulk [read-only fields]', async () => {
  const transientStudyRequestBulk = generateStudyRequestBulk();
  mockDAOsForStudyRequestBulk(transientStudyRequestBulk);

  client.setUser(requester);
  let response = await client.fetch('/requests/study/bulk', {
    method: 'POST',
    data: transientStudyRequestBulk,
  });
  const persistedStudyRequestBulk = response.result;

  // cannot change ID
  client.setUser(supervisor);
  response = await client.fetch(`/requests/study/bulk/${persistedStudyRequestBulk.id}`, {
    method: 'PUT',
    data: {
      ...persistedStudyRequestBulk,
      id: persistedStudyRequestBulk.id + 1000,
    },
  });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);

  // cannot change createdAt
  response = await client.fetch(`/requests/study/bulk/${persistedStudyRequestBulk.id}`, {
    method: 'PUT',
    data: {
      ...persistedStudyRequestBulk,
      createdAt: DateTime.local().minus({ weeks: 3 }),
    },
  });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);
});

test('StudyRequestBulkController.putStudyRequestBulk [no adding / removing requests]', async () => {
  const transientStudyRequestBulk = generateStudyRequestBulk();
  mockDAOsForStudyRequestBulk(transientStudyRequestBulk);

  client.setUser(requester);
  let response = await client.fetch('/requests/study/bulk', {
    method: 'POST',
    data: transientStudyRequestBulk,
  });
  const persistedStudyRequestBulk = response.result;

  // cannot add requests
  client.setUser(supervisor);
  response = await client.fetch(`/requests/study/bulk/${persistedStudyRequestBulk.id}`, {
    method: 'PUT',
    data: {
      ...persistedStudyRequestBulk,
      studyRequests: [
        ...persistedStudyRequestBulk.studyRequests,
        generateStudyRequest(),
      ],
    },
  });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);

  // cannot remove requests
  client.setUser(supervisor);
  response = await client.fetch(`/requests/study/bulk/${persistedStudyRequestBulk.id}`, {
    method: 'PUT',
    data: {
      ...persistedStudyRequestBulk,
      studyRequests: persistedStudyRequestBulk.studyRequests.slice(1),
    },
  });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);
});

test('StudyRequestBulkController.putStudyRequestBulkRequests [adding to project]', async () => {
  const TP = generateStudyRequestBulk();
  mockDAOsForStudyRequestBulk(TP);

  client.setUser(requester);
  let response = await client.fetch('/requests/study/bulk', {
    method: 'POST',
    data: TP,
  });
  let P = response.result;
  const Rs = P.studyRequests;

  client.setUser(requester);
  response = await client.fetch('/requests/study', {
    method: 'POST',
    data: generateStudyRequest(),
  });
  const R1 = response.result;
  client.setUser(ett1);
  response = await client.fetch('/requests/study', {
    method: 'POST',
    data: generateStudyRequest(),
  });
  const R2 = response.result;

  Mailer.send.mockClear();
  client.setUser(supervisor);
  response = await client.fetch(`/requests/study/bulk/${P.id}/requests`, {
    method: 'PUT',
    data: {
      studyRequestIds: [R1.id, R2.id],
    },
  });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(Mailer.send).toHaveBeenCalledTimes(0);
  P = response.result;
  R1.studyRequestBulkId = P.id;
  R2.studyRequestBulkId = P.id;
  expect(P.userId).toBe(requester.id);
  expect(P.studyRequests).toEqual([...Rs, R1, R2]);
});

test('StudyRequestBulkController.putStudyRequestBulkRequests [moving between projects]', async () => {
  const TP1 = generateStudyRequestBulk();
  mockDAOsForStudyRequestBulk(TP1);

  client.setUser(requester);
  let response = await client.fetch('/requests/study/bulk', {
    method: 'POST',
    data: TP1,
  });
  let P1 = response.result;
  const Rs1 = P1.studyRequests;

  const TP2 = generateStudyRequestBulk();
  mockDAOsForStudyRequestBulk(TP2);

  client.setUser(requester);
  response = await client.fetch('/requests/study/bulk', {
    method: 'POST',
    data: TP1,
  });
  let P2 = response.result;
  let Rs2 = P2.studyRequests;

  Mailer.send.mockClear();
  client.setUser(supervisor);
  response = await client.fetch(`/requests/study/bulk/${P1.id}/requests`, {
    method: 'PUT',
    data: {
      studyRequestIds: Rs2.slice(1).map(({ id }) => id),
    },
  });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(Mailer.send).toHaveBeenCalledTimes(0);
  P1 = response.result;
  Rs2 = Rs2.map((studyRequest, i) => {
    if (i === 0) {
      return studyRequest;
    }
    return {
      ...studyRequest,
      studyRequestBulkId: P1.id,
    };
  });
  expect(P1.userId).toBe(requester.id);
  expect(P1.studyRequests).toEqual([...Rs1, ...Rs2.slice(1)]);

  response = await client.fetch(`/requests/study/bulk/${P2.id}`, {
    method: 'GET',
  });
  P2 = response.result;
  expect(P2.userId).toBe(requester.id);
  expect(P2.studyRequests).toEqual([Rs2[0]]);
});

function expectStudyRequestChanges(actual, expected) {
  expect(actual).toHaveLength(expected.length);
  expected.forEach((status, i) => {
    expect(actual[i].status).toBe(status);
  });
}

test('StudyRequestBulkController.deleteStudyRequestBulkRequests', async () => {
  client.setUser(requester);
  let response = await client.fetch('/requests/study/bulk', {
    method: 'POST',
    data: generateStudyRequestBulk(),
  });
  let P1 = response.result;
  const Rs1 = P1.studyRequests;

  client.setUser(ett1);
  response = await client.fetch('/requests/study/bulk', {
    method: 'POST',
    data: generateStudyRequestBulk(),
  });
  let P2 = response.result;
  const Rs2 = P2.studyRequests;

  Mailer.send.mockClear();
  client.setUser(supervisor);
  response = await client.fetch('/requests/study/bulk/requests', {
    method: 'DELETE',
    data: {
      studyRequestIds: [Rs1[0].id, Rs2[0].id],
    },
  });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(Mailer.send).toHaveBeenCalledTimes(0);
  expect(response.result).toEqual({ success: true });
  Rs1[0].studyRequestBulkId = null;
  Rs2[0].studyRequestBulkId = null;

  response = await client.fetch(`/requests/study/bulk/${P1.id}`, {
    method: 'GET',
  });
  P1 = response.result;
  expect(P1.userId).toBe(requester.id);
  expect(P1.studyRequests).toEqual(Rs1.slice(1));

  response = await client.fetch(`/requests/study/bulk/${P2.id}`, {
    method: 'GET',
  });
  P2 = response.result;
  expect(P2.userId).toBe(ett1.id);
  expect(P2.studyRequests).toEqual(Rs2.slice(1));

  response = await client.fetch(`/requests/study/${Rs1[0].id}`, {
    method: 'GET',
  });
  const R1 = response.result;
  expect(R1).toEqual(Rs1[0]);

  response = await client.fetch(`/requests/study/${Rs2[0].id}`, {
    method: 'GET',
  });
  const R2 = response.result;
  expect(R2).toEqual(Rs2[0]);
});

test('StudyRequestBulkController.getStudyRequestBulkChanges', async () => {
  const transientStudyRequestBulk = generateStudyRequestBulk();
  mockDAOsForStudyRequestBulk(transientStudyRequestBulk);

  client.setUser(requester);
  let response = await client.fetch('/requests/study/bulk', {
    method: 'POST',
    data: transientStudyRequestBulk,
  });
  let persistedStudyRequestBulk = response.result;

  // newly created study request has no changes
  response = await client.fetch(`/requests/study/bulk/${persistedStudyRequestBulk.id}/changes`);
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expectStudyRequestChanges(response.result, []);

  // update study request fields
  persistedStudyRequestBulk.studyRequests.forEach((studyRequest) => {
    /* eslint-disable no-param-reassign */
    studyRequest.status = StudyRequestStatus.ASSIGNED;
    studyRequest.assignedTo = StudyRequestAssignee.FIELD_STAFF;
    /* eslint-enable no-param-reassign */
  });

  client.setUser(supervisor);
  response = await client.fetch(`/requests/study/bulk/${persistedStudyRequestBulk.id}`, {
    method: 'PUT',
    data: persistedStudyRequestBulk,
  });
  persistedStudyRequestBulk = response.result;

  // fetches changes for all study requests
  response = await client.fetch(`/requests/study/bulk/${persistedStudyRequestBulk.id}/changes`);
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  let expected = persistedStudyRequestBulk.studyRequests.map(() => StudyRequestStatus.ASSIGNED);
  expectStudyRequestChanges(response.result, expected);

  persistedStudyRequestBulk.studyRequests[0].status = StudyRequestStatus.REJECTED;
  response = await client.fetch(`/requests/study/bulk/${persistedStudyRequestBulk.id}`, {
    method: 'PUT',
    data: persistedStudyRequestBulk,
  });
  persistedStudyRequestBulk = response.result;

  // can change individual request statuses
  response = await client.fetch(`/requests/study/bulk/${persistedStudyRequestBulk.id}/changes`);
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expected = [
    StudyRequestStatus.REJECTED,
    ...persistedStudyRequestBulk.studyRequests.map(() => StudyRequestStatus.ASSIGNED),
  ];
  expectStudyRequestChanges(response.result, expected);
});
