import {
  StudyHours,
  StudyRequestReason,
  StudyRequestStatus,
  StudyType,
} from '@/lib/Constants';
import db from '@/lib/db/db';
import StudyRequestDAO from '@/lib/db/StudyRequestDAO';
import UserDAO from '@/lib/db/UserDAO';
import StudyRequest from '@/lib/model/StudyRequest';
import { generateStudyRequest } from '@/lib/test/random/StudyRequestGenerator';
import { generateUser } from '@/lib/test/random/UserGenerator';

afterAll(() => {
  db.$pool.end();
});

test('StudyRequestDAO', async () => {
  const transientUser = generateUser();
  const persistedUser = await UserDAO.create(transientUser);

  const transientStudyRequest = generateStudyRequest();

  // generate second user for multi-user updates
  const transientUser2 = generateUser();
  const persistedUser2 = await UserDAO.create(transientUser2);

  // save study request
  let persistedStudyRequest = await StudyRequestDAO.create(transientStudyRequest, persistedUser);
  expect(persistedStudyRequest.id).not.toBeNull();
  expect(persistedStudyRequest.userId).toBe(persistedUser.id);
  expect(persistedStudyRequest.status).toBe(StudyRequestStatus.REQUESTED);
  expect(persistedStudyRequest.closed).toBe(false);
  await expect(
    StudyRequest.read.validateAsync(persistedStudyRequest),
  ).resolves.toEqual(persistedStudyRequest);

  // fetch saved study request
  let fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);

  // fetch by centreline
  let fetchedStudyRequests = await StudyRequestDAO.byCentreline([transientStudyRequest]);
  expect(fetchedStudyRequests).toContainEqual(persistedStudyRequest);

  // fetch by centreline pending
  fetchedStudyRequests = await StudyRequestDAO.byCentrelinePending([transientStudyRequest]);
  expect(fetchedStudyRequests).toContainEqual(persistedStudyRequest);

  // fetch by user
  let byUser = await StudyRequestDAO.byUser(persistedUser);
  expect(byUser).toContainEqual(persistedStudyRequest);

  // fetch all
  let all = await StudyRequestDAO.all();
  expect(all).toContainEqual(persistedStudyRequest);

  // fetch all non-bulk
  let allNonBulk = await StudyRequestDAO.allNonBulk();
  expect(allNonBulk).toContainEqual(persistedStudyRequest);

  // update existing study fields
  persistedStudyRequest.studyType = StudyType.TMC;
  persistedStudyRequest.studyTypeOther = null;
  persistedStudyRequest.daysOfWeek = [3, 4];
  persistedStudyRequest.duration = null;
  persistedStudyRequest.hours = StudyHours.SCHOOL;
  persistedStudyRequest.notes = 'oops, this is actually a school count';
  persistedStudyRequest = await StudyRequestDAO.update(persistedStudyRequest, persistedUser);
  fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);
  expect(fetchedStudyRequest.lastEditorId).toEqual(persistedUser.id);

  // update request reason
  persistedStudyRequest.reason = StudyRequestReason.PED_SAFETY;
  persistedStudyRequest.reasonOther = null;
  persistedStudyRequest = await StudyRequestDAO.update(persistedStudyRequest, persistedUser);
  fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);
  expect(fetchedStudyRequest.lastEditorId).toEqual(persistedUser.id);

  // update request reason: other
  persistedStudyRequest.reason = StudyRequestReason.OTHER;
  persistedStudyRequest.reasonOther = 'unicorns!';
  persistedStudyRequest = await StudyRequestDAO.update(persistedStudyRequest, persistedUser);
  fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);
  expect(fetchedStudyRequest.lastEditorId).toEqual(persistedUser.id);

  // update study type: other
  persistedStudyRequest.studyType = StudyType.OTHER_MANUAL;
  persistedStudyRequest.studyTypeOther = 'counting domesticated chickens crossing the road';
  persistedStudyRequest = await StudyRequestDAO.update(persistedStudyRequest, persistedUser);
  fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);
  expect(fetchedStudyRequest.lastEditorId).toEqual(persistedUser.id);

  // set as urgent with second user
  persistedStudyRequest.urgent = true;
  persistedStudyRequest.urgentReason = 'because I said so';
  persistedStudyRequest.ccEmails = ['Evan.Savage@toronto.ca'];
  persistedStudyRequest = await StudyRequestDAO.update(persistedStudyRequest, persistedUser2);
  fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);
  expect(fetchedStudyRequest.lastEditorId).toEqual(persistedUser2.id);

  // close with first user
  persistedStudyRequest.closed = true;
  persistedStudyRequest = await StudyRequestDAO.update(persistedStudyRequest, persistedUser);
  fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);
  expect(fetchedStudyRequest.lastEditorId).toEqual(persistedUser.id);

  // fetch by centreline
  fetchedStudyRequests = await StudyRequestDAO.byCentreline([transientStudyRequest]);
  expect(fetchedStudyRequests).toContainEqual(persistedStudyRequest);

  // fetch by centreline pending
  fetchedStudyRequests = await StudyRequestDAO.byCentrelinePending([transientStudyRequest]);
  expect(fetchedStudyRequests).not.toContainEqual(persistedStudyRequest);

  // reopen
  persistedStudyRequest.closed = false;
  persistedStudyRequest = await StudyRequestDAO.update(persistedStudyRequest, persistedUser);
  fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);

  // change study details
  persistedStudyRequest.daysOfWeek = [0, 6];
  persistedStudyRequest.duration = 48;
  persistedStudyRequest.hours = null;
  persistedStudyRequest.notes = 'complete during shopping mall peak hours';
  persistedStudyRequest.studyType = StudyType.ATR_SPEED_VOLUME;
  persistedStudyRequest.studyTypeOther = null;
  persistedStudyRequest = await StudyRequestDAO.update(persistedStudyRequest, persistedUser);
  fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);

  // delete study request
  await expect(StudyRequestDAO.delete(persistedStudyRequest)).resolves.toBe(true);
  fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toBeNull();

  // fetch by centreline
  fetchedStudyRequests = await StudyRequestDAO.byCentreline([transientStudyRequest]);
  expect(fetchedStudyRequests).not.toContainEqual(persistedStudyRequest);

  // fetch by centreline pending
  fetchedStudyRequests = await StudyRequestDAO.byCentrelinePending([transientStudyRequest]);
  expect(fetchedStudyRequests).not.toContainEqual(persistedStudyRequest);

  // delete: should not work again
  await expect(StudyRequestDAO.delete(persistedStudyRequest)).resolves.toBe(false);

  // fetch by user
  byUser = await StudyRequestDAO.byUser(persistedUser);
  expect(byUser).toEqual([]);

  // fetch all
  all = await StudyRequestDAO.all();
  expect(all).not.toContainEqual(persistedStudyRequest);

  // fetch all non-bulk
  allNonBulk = await StudyRequestDAO.allNonBulk();
  expect(allNonBulk).not.toContainEqual(persistedStudyRequest);
});
