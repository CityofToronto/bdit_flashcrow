import {
  CentrelineType,
  StudyHours,
  StudyRequestReason,
  StudyRequestStatus,
  StudyType,
} from '@/lib/Constants';
import db from '@/lib/db/db';
import StudyRequestDAO from '@/lib/db/StudyRequestDAO';
import UserDAO from '@/lib/db/UserDAO';
import StudyRequest from '@/lib/model/StudyRequest';
import { generateUser } from '@/lib/test/random/UserGenerator';
import DateTime from '@/lib/time/DateTime';

afterAll(() => {
  db.$pool.end();
});

test('StudyRequestDAO', async () => {
  const transientUser = generateUser();
  const persistedUser = await UserDAO.create(transientUser);
  const now = DateTime.local();
  const transientStudyRequest = {
    urgent: false,
    urgentReason: null,
    assignedTo: null,
    dueDate: now.plus({ months: 3 }),
    estimatedDeliveryDate: now.plus({ months: 2, weeks: 3 }),
    reason: StudyRequestReason.TSC,
    reasonOther: null,
    ccEmails: [],
    studyType: StudyType.TMC,
    daysOfWeek: [2, 3, 4],
    duration: null,
    hours: StudyHours.ROUTINE,
    notes: 'completely normal routine turning movement count',
    centrelineId: 1729,
    centrelineType: CentrelineType.INTERSECTION,
    geom: {
      type: 'Point',
      coordinates: [-79.333251, 43.709012],
    },
  };
  const features = [{ centrelineId: 1729, centrelineType: CentrelineType.INTERSECTION }];

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
  let fetchedStudyRequests = await StudyRequestDAO.byCentreline(features);
  expect(fetchedStudyRequests).toContainEqual(persistedStudyRequest);

  // fetch by centreline pending
  fetchedStudyRequests = await StudyRequestDAO.byCentrelinePending(features);
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
  persistedStudyRequest.daysOfWeek = [3, 4];
  persistedStudyRequest.hours = StudyHours.SCHOOL;
  persistedStudyRequest.notes = 'oops, this is actually a school count';
  persistedStudyRequest = await StudyRequestDAO.update(persistedStudyRequest, persistedUser);
  fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);
  expect(fetchedStudyRequest.lastEditorId).toEqual(persistedUser.id);

  // update request reason
  persistedStudyRequest.reason = StudyRequestReason.PED_SAFETY;
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
  fetchedStudyRequests = await StudyRequestDAO.byCentreline(features);
  expect(fetchedStudyRequests).toContainEqual(persistedStudyRequest);

  // fetch by centreline pending
  fetchedStudyRequests = await StudyRequestDAO.byCentrelinePending(features);
  expect(fetchedStudyRequests).not.toContainEqual(persistedStudyRequest);

  // reopen
  persistedStudyRequest.closed = false;
  persistedStudyRequest = await StudyRequestDAO.update(persistedStudyRequest, persistedUser);
  fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);

  // change study details
  persistedStudyRequest.studyType = StudyType.TMC;
  persistedStudyRequest.daysOfWeek = [0, 6];
  persistedStudyRequest.duration = null;
  persistedStudyRequest.hours = StudyHours.OTHER;
  persistedStudyRequest.notes = 'complete during shopping mall peak hours';
  persistedStudyRequest = await StudyRequestDAO.update(persistedStudyRequest, persistedUser);
  fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toEqual(persistedStudyRequest);

  // delete study request
  await expect(StudyRequestDAO.delete(persistedStudyRequest)).resolves.toBe(true);
  fetchedStudyRequest = await StudyRequestDAO.byId(persistedStudyRequest.id);
  expect(fetchedStudyRequest).toBeNull();

  // fetch by centreline
  fetchedStudyRequests = await StudyRequestDAO.byCentreline(features);
  expect(fetchedStudyRequests).not.toContainEqual(persistedStudyRequest);

  // fetch by centreline pending
  fetchedStudyRequests = await StudyRequestDAO.byCentrelinePending(features);
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
