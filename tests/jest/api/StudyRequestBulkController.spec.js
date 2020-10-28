import {
  AuthScope,
  HttpStatus,
  LocationSelectionType,
} from '@/lib/Constants';
import config from '@/lib/config/MoveConfig';
import db from '@/lib/db/db';
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import UserDAO from '@/lib/db/UserDAO';
import Mailer from '@/lib/email/Mailer';
import CompositeId from '@/lib/io/CompositeId';
import InjectBackendClient from '@/lib/test/api/InjectBackendClient';
import { generateStudyRequestBulk } from '@/lib/test/random/StudyRequestGenerator';
import { generateUser } from '@/lib/test/random/UserGenerator';
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
  const { s1 } = studyRequestBulk;
  const features = CompositeId.decode(s1);
  const resolvedValue = features.map(({ centrelineId, centrelineType }) => ({
    centrelineId,
    centrelineType,
    description: 'Mocked location description',
  }));
  CentrelineDAO.byFeatures.mockResolvedValue(resolvedValue);
}

test('StudyRequestBulkController.postStudyRequestBulk', async () => {
  const transientStudyRequestBulk = generateStudyRequestBulk();
  mockDAOsForStudyRequestBulk(transientStudyRequestBulk);

  client.setUser(requester);
  let response = await client.fetch('/requests/study/bulk', {
    method: 'POST',
    data: transientStudyRequestBulk,
  });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(Mailer.send).toHaveBeenCalled();
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

test('StudyRequestBulkController.getStudyRequestBulk', async () => {
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

test('StudyRequestController.getStudyRequestBulkName', async () => {
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

test('StudyRequestController.getStudyRequestsBulkByLocationsSelectionPending', async () => {
  const transientStudyRequestBulk = generateStudyRequestBulk();
  mockDAOsForStudyRequestBulk(transientStudyRequestBulk);

  client.setUser(requester);
  let response = await client.fetch('/requests/study/bulk', {
    method: 'POST',
    data: transientStudyRequestBulk,
  });
  const persistedStudyRequestBulk = response.result;
  const s1 = CompositeId.encode(persistedStudyRequestBulk.studyRequests);

  // requester can fetch by centreline pending
  const data = { s1, selectionType: LocationSelectionType.POINTS };
  response = await client.fetch('/requests/study/bulk/byLocationsSelection/pending', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  let fetchedStudyRequestsBulk = response.result;
  expect(fetchedStudyRequestsBulk).toContainEqual(persistedStudyRequestBulk);

  // other ETT1s can fetch by centreline pending
  client.setUser(ett1);
  response = await client.fetch('/requests/study/bulk/byLocationsSelection/pending', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  fetchedStudyRequestsBulk = response.result;
  expect(fetchedStudyRequestsBulk).toContainEqual(persistedStudyRequestBulk);

  // supervisors can fetch by centreline pending
  client.setUser(supervisor);
  response = await client.fetch('/requests/study/bulk/byLocationsSelection/pending', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  fetchedStudyRequestsBulk = response.result;
  expect(fetchedStudyRequestsBulk).toContainEqual(persistedStudyRequestBulk);
});
