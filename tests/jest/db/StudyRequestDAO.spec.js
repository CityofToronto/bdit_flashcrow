import {
  StudyHours,
  StudyRequestReason,
  StudyRequestStatus,
  StudyType,
} from '@/lib/Constants';
import db from '@/lib/db/db';
import StudyRequestDAO from '@/lib/db/StudyRequestDAO';
import StudyRequestBulkDAO from '@/lib/db/StudyRequestBulkDAO';
import UserDAO from '@/lib/db/UserDAO';
import StudyRequest from '@/lib/model/StudyRequest';
import RequestActions from '@/lib/requests/RequestActions';
import {
  generateStudyRequest,
  generateStudyRequestBulk,
} from '@/lib/test/random/StudyRequestGenerator';
import { generateUser } from '@/lib/test/random/UserGenerator';

let user;

async function initUser() {
  const transientUser = generateUser();
  user = await UserDAO.create(transientUser);
}

beforeAll(async () => {
  await initUser();
});

afterAll(() => {
  db.$pool.end();
});

test('StudyRequestDAO.byId [invalid ID]', async () => {
  const studyRequest = await StudyRequestDAO.byId(-1);
  expect(studyRequest).toBeNull();
});

test('StudyRequestDAO.byId', async () => {
  const transientStudyRequest = generateStudyRequest();
  const persistedStudyRequest = await StudyRequestDAO.create(transientStudyRequest, user);

  const studyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  await expect(
    StudyRequest.read.validateAsync(studyRequest),
  ).resolves.toEqual(studyRequest);
  expect(studyRequest).toEqual(persistedStudyRequest);
});

test('StudyRequestDAO.byIds [empty]', async () => {
  const studyRequests = await StudyRequestDAO.byIds([]);
  expect(studyRequests).toEqual([]);
});

test('StudyRequestDAO.byIds [invalid IDs]', async () => {
  const studyRequests = await StudyRequestDAO.byIds([-1]);
  expect(studyRequests).toEqual([]);
});

test('StudyRequestDAO.byIds', async () => {
  const transientStudyRequest1 = generateStudyRequest();
  const persistedStudyRequest1 = await StudyRequestDAO.create(transientStudyRequest1, user);
  let studyRequests = await StudyRequestDAO.byIds([persistedStudyRequest1.id]);
  expect(studyRequests).toEqual([persistedStudyRequest1]);

  const transientStudyRequest2 = generateStudyRequest();
  const persistedStudyRequest2 = await StudyRequestDAO.create(transientStudyRequest2, user);
  studyRequests = await StudyRequestDAO.byIds([
    persistedStudyRequest1.id,
    persistedStudyRequest2.id,
  ]);
  expect(studyRequests).toEqual([persistedStudyRequest1, persistedStudyRequest2]);

  studyRequests = await StudyRequestDAO.byIds([
    persistedStudyRequest2.id,
    persistedStudyRequest1.id,
  ]);
  expect(studyRequests).toEqual([persistedStudyRequest1, persistedStudyRequest2]);
});

test('StudyRequestDAO.byStudyRequestBulk', async () => {
  const transientStudyRequestBulk = generateStudyRequestBulk();
  const persistedStudyRequestBulk = await StudyRequestBulkDAO.create(
    transientStudyRequestBulk,
    user,
  );

  const studyRequests = await StudyRequestDAO.byStudyRequestBulk(persistedStudyRequestBulk);
  expect(studyRequests).toEqual(persistedStudyRequestBulk.studyRequests);
});

test('StudyRequestDAO.byStudyRequestsBulk [empty]', async () => {
  const studyRequests = await StudyRequestDAO.byStudyRequestsBulk([]);
  expect(studyRequests).toEqual([]);
});

test('StudyRequestDAO.byStudyRequestsBulk', async () => {
  const transientStudyRequestBulk1 = generateStudyRequestBulk();
  const persistedStudyRequestBulk1 = await StudyRequestBulkDAO.create(
    transientStudyRequestBulk1,
    user,
  );

  let studyRequests = await StudyRequestDAO.byStudyRequestsBulk([persistedStudyRequestBulk1]);
  expect(studyRequests).toEqual(persistedStudyRequestBulk1.studyRequests);

  const transientStudyRequestBulk2 = generateStudyRequestBulk();
  const persistedStudyRequestBulk2 = await StudyRequestBulkDAO.create(
    transientStudyRequestBulk2,
    user,
  );

  studyRequests = await StudyRequestDAO.byStudyRequestsBulk([
    persistedStudyRequestBulk1,
    persistedStudyRequestBulk2,
  ]);
  expect(studyRequests).toEqual([
    ...persistedStudyRequestBulk1.studyRequests,
    ...persistedStudyRequestBulk2.studyRequests,
  ]);
});

test('StudyRequestDAO.byCentreline [empty]', async () => {
  const studyRequests = await StudyRequestDAO.byCentreline([]);
  expect(studyRequests).toEqual([]);
});

test('StudyRequestDAO.byCentreline', async () => {
  const transientStudyRequest1 = generateStudyRequest();
  const persistedStudyRequest1 = await StudyRequestDAO.create(transientStudyRequest1, user);
  let studyRequests = await StudyRequestDAO.byCentreline([persistedStudyRequest1]);
  expect(studyRequests).toContainEqual(persistedStudyRequest1);

  const transientStudyRequest2 = generateStudyRequest();
  const persistedStudyRequest2 = await StudyRequestDAO.create(transientStudyRequest2, user);
  studyRequests = await StudyRequestDAO.byCentreline([
    persistedStudyRequest1,
    persistedStudyRequest2,
  ]);
  expect(studyRequests).toContainEqual(persistedStudyRequest1);
  expect(studyRequests).toContainEqual(persistedStudyRequest2);
});

test('StudyRequestDAO.byCentrelinePending [empty]', async () => {
  const studyRequests = await StudyRequestDAO.byCentrelinePending([]);
  expect(studyRequests).toEqual([]);
});

test('StudyRequestDAO.byCentrelinePending', async () => {
  const transientStudyRequest1 = generateStudyRequest();
  let persistedStudyRequest1 = await StudyRequestDAO.create(transientStudyRequest1, user);
  let studyRequests = await StudyRequestDAO.byCentrelinePending([persistedStudyRequest1]);
  expect(studyRequests).toContainEqual(persistedStudyRequest1);

  const transientStudyRequest2 = generateStudyRequest();
  const persistedStudyRequest2 = await StudyRequestDAO.create(transientStudyRequest2, user);
  studyRequests = await StudyRequestDAO.byCentrelinePending([
    persistedStudyRequest1,
    persistedStudyRequest2,
  ]);
  expect(studyRequests).toContainEqual(persistedStudyRequest1);
  expect(studyRequests).toContainEqual(persistedStudyRequest2);

  RequestActions.actionMarkCompleted(persistedStudyRequest1);
  persistedStudyRequest1 = await StudyRequestDAO.update(persistedStudyRequest1);
  studyRequests = await StudyRequestDAO.byCentrelinePending([
    persistedStudyRequest1,
    persistedStudyRequest2,
  ]);
  expect(studyRequests).not.toContainEqual(persistedStudyRequest1);
  expect(studyRequests).toContainEqual(persistedStudyRequest2);
});

test('StudyRequestDAO.create', async () => {
  const transientStudyRequest = generateStudyRequest();

  // save study request
  const persistedStudyRequest = await StudyRequestDAO.create(transientStudyRequest, user);
  expect(persistedStudyRequest.id).not.toBeNull();
  expect(persistedStudyRequest.userId).toBe(user.id);
  expect(persistedStudyRequest.status).toBe(StudyRequestStatus.REQUESTED);
  await expect(
    StudyRequest.read.validateAsync(persistedStudyRequest),
  ).resolves.toEqual(persistedStudyRequest);
});

test('StudyRequestDAO.update [study details]', async () => {
  const transientStudyRequest = generateStudyRequest();
  let persistedStudyRequest = await StudyRequestDAO.create(transientStudyRequest, user);

  // update existing study fields
  persistedStudyRequest.studyType = StudyType.TMC;
  persistedStudyRequest.studyTypeOther = null;
  persistedStudyRequest.daysOfWeek = [3, 4];
  persistedStudyRequest.duration = null;
  persistedStudyRequest.hours = StudyHours.SCHOOL;
  persistedStudyRequest.notes = 'oops, this is actually a school count';
  persistedStudyRequest = await StudyRequestDAO.update(persistedStudyRequest);
  let fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);

  // update request reason
  persistedStudyRequest.reason = StudyRequestReason.PED_SAFETY;
  persistedStudyRequest.reasonOther = null;
  persistedStudyRequest = await StudyRequestDAO.update(persistedStudyRequest);
  fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);

  // update request reason: other
  persistedStudyRequest.reason = StudyRequestReason.OTHER;
  persistedStudyRequest.reasonOther = 'unicorns!';
  persistedStudyRequest = await StudyRequestDAO.update(persistedStudyRequest);
  fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);

  // update study type: other
  persistedStudyRequest.studyType = StudyType.OTHER_MANUAL;
  persistedStudyRequest.studyTypeOther = 'counting domesticated chickens crossing the road';
  persistedStudyRequest = await StudyRequestDAO.update(persistedStudyRequest);
  fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);

  // set as urgent
  persistedStudyRequest.urgent = true;
  persistedStudyRequest.urgentReason = 'because I said so';
  persistedStudyRequest.ccEmails = ['Evan.Savage@toronto.ca'];
  persistedStudyRequest = await StudyRequestDAO.update(persistedStudyRequest);
  fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);

  // change study details
  persistedStudyRequest.daysOfWeek = [0, 6];
  persistedStudyRequest.duration = 48;
  persistedStudyRequest.hours = null;
  persistedStudyRequest.notes = 'complete during shopping mall peak hours';
  persistedStudyRequest.studyType = StudyType.ATR_SPEED_VOLUME;
  persistedStudyRequest.studyTypeOther = null;
  persistedStudyRequest = await StudyRequestDAO.update(persistedStudyRequest);
  fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);
});

test('StudyRequestDAO.update [status actions]', async () => {
  const transientStudyRequest = generateStudyRequest();
  let persistedStudyRequest = await StudyRequestDAO.create(transientStudyRequest, user);

  // complete
  RequestActions.actionMarkCompleted(persistedStudyRequest);
  persistedStudyRequest = await StudyRequestDAO.update(persistedStudyRequest);
  let fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);

  // fetch by centreline pending
  let fetchedStudyRequests = await StudyRequestDAO.byCentrelinePending([persistedStudyRequest]);
  expect(fetchedStudyRequests).not.toContainEqual(persistedStudyRequest);

  // reopen
  RequestActions.actionReopen(persistedStudyRequest);
  persistedStudyRequest = await StudyRequestDAO.update(persistedStudyRequest);
  fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);

  // fetch by centreline pending
  fetchedStudyRequests = await StudyRequestDAO.byCentrelinePending([persistedStudyRequest]);
  expect(fetchedStudyRequests).toContainEqual(persistedStudyRequest);
});

test('StudyRequestDAO.delete', async () => {
  const transientStudyRequest = generateStudyRequest();
  const persistedStudyRequest = await StudyRequestDAO.create(transientStudyRequest, user);

  // delete study request
  await expect(StudyRequestDAO.delete(persistedStudyRequest)).resolves.toBe(true);
  const fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toBeNull();

  // fetch by centreline
  let fetchedStudyRequests = await StudyRequestDAO.byCentreline([transientStudyRequest]);
  expect(fetchedStudyRequests).not.toContainEqual(persistedStudyRequest);

  // fetch by centreline pending
  fetchedStudyRequests = await StudyRequestDAO.byCentrelinePending([transientStudyRequest]);
  expect(fetchedStudyRequests).not.toContainEqual(persistedStudyRequest);

  // delete: should not work again
  await expect(StudyRequestDAO.delete(persistedStudyRequest)).resolves.toBe(false);
});
