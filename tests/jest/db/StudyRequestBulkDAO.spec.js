import {
  CentrelineType,
  LocationSelectionType,
  StudyHours,
  StudyRequestReason,
  StudyType,
} from '@/lib/Constants';
import db from '@/lib/db/db';
import StudyRequestDAO from '@/lib/db/StudyRequestDAO';
import StudyRequestBulkDAO from '@/lib/db/StudyRequestBulkDAO';
import UserDAO from '@/lib/db/UserDAO';
import CompositeId from '@/lib/io/CompositeId';
import StudyRequestBulk from '@/lib/model/StudyRequestBulk';
import { generateUser } from '@/lib/test/random/UserGenerator';
import DateTime from '@/lib/time/DateTime';

afterAll(() => {
  db.$pool.end();
});

test('StudyRequestBulkDAO', async () => {
  const transientUser = generateUser();
  const persistedUser = await UserDAO.create(transientUser);
  const now = DateTime.local();

  const transientStudyRequest1 = {
    urgent: false,
    urgentReason: null,
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

  const transientStudyRequest2 = {
    urgent: false,
    urgentReason: null,
    dueDate: now.plus({ months: 3 }),
    estimatedDeliveryDate: now.plus({ months: 2, weeks: 3 }),
    reason: StudyRequestReason.TSC,
    reasonOther: null,
    ccEmails: [],
    studyType: StudyType.ATR_SPEED_VOLUME,
    daysOfWeek: [2, 3, 4],
    duration: 72,
    hours: null,
    notes: 'completely normal routine turning movement count',
    centrelineId: 5555,
    centrelineType: CentrelineType.SEGMENT,
    geom: {
      type: 'Point',
      coordinates: [-79.343251, 43.709012],
    },
  };

  const studyRequests = [transientStudyRequest1, transientStudyRequest2];
  const features = studyRequests.map(
    ({ centrelineId, centrelineType }) => ({ centrelineId, centrelineType }),
  );
  const s1 = CompositeId.encode(features);

  const transientStudyRequestBulk = {
    ccEmails: [],
    dueDate: now.plus({ months: 3 }),
    estimatedDeliveryDate: now.plus({ months: 2, weeks: 3 }),
    name: 'best bulk request ever',
    reason: StudyRequestReason.TSC,
    reasonOther: null,
    s1,
    selectionType: LocationSelectionType.POINTS,
    studyRequests,
    urgent: false,
    urgentReason: null,
  };

  // generate second user for multi-user updates
  const transientUser2 = generateUser();
  const persistedUser2 = await UserDAO.create(transientUser2);

  // save bulk study request
  let persistedStudyRequestBulk = await StudyRequestBulkDAO.create(
    transientStudyRequestBulk,
    persistedUser,
  );
  expect(persistedStudyRequestBulk.id).not.toBeNull();
  expect(persistedStudyRequestBulk.userId).toBe(persistedUser.id);
  expect(persistedStudyRequestBulk.studyRequests[0].userId).toBe(persistedUser.id);
  expect(persistedStudyRequestBulk.studyRequests[0].studyRequestBulkId)
    .toBe(persistedStudyRequestBulk.id);
  expect(persistedStudyRequestBulk.studyRequests[1].userId).toBe(persistedUser.id);
  expect(persistedStudyRequestBulk.studyRequests[1].studyRequestBulkId)
    .toBe(persistedStudyRequestBulk.id);
  await expect(
    StudyRequestBulk.read.validateAsync(persistedStudyRequestBulk),
  ).resolves.toEqual(persistedStudyRequestBulk);

  // fetch saved bulk study request
  let fetchedStudyRequestBulk = await StudyRequestBulkDAO.byId(persistedStudyRequestBulk.id);
  expect(fetchedStudyRequestBulk).toEqual(persistedStudyRequestBulk);

  // fetch using byIds
  let fetchedStudyRequestsBulk = await StudyRequestBulkDAO.byIds([persistedStudyRequestBulk.id]);
  expect(fetchedStudyRequestsBulk).toEqual([persistedStudyRequestBulk]);

  // fetch all
  let all = await StudyRequestBulkDAO.all();
  expect(all).toContainEqual(persistedStudyRequestBulk);

  // fetch study requests by bulk request
  let byStudyRequestBulk = await StudyRequestDAO.byStudyRequestBulk(persistedStudyRequestBulk);
  expect(byStudyRequestBulk).toEqual(persistedStudyRequestBulk.studyRequests);

  // fetch study requests by bulk requests
  let byStudyRequestsBulk = await StudyRequestDAO.byStudyRequestsBulk([persistedStudyRequestBulk]);
  expect(byStudyRequestsBulk).toEqual(persistedStudyRequestBulk.studyRequests);

  // update existing bulk request fields
  persistedStudyRequestBulk.name = 'new and improved bulk study request';
  persistedStudyRequestBulk.reason = StudyRequestReason.OTHER;
  persistedStudyRequestBulk.reasonOther = 'for glory!';
  persistedStudyRequestBulk = await StudyRequestBulkDAO.update(
    persistedStudyRequestBulk,
    persistedUser,
  );
  fetchedStudyRequestBulk = await StudyRequestBulkDAO.byId(persistedStudyRequestBulk.id);
  expect(fetchedStudyRequestBulk).toEqual(persistedStudyRequestBulk);
  expect(fetchedStudyRequestBulk.lastEditorId).toEqual(persistedUser.id);

  // set as urgent with second user
  persistedStudyRequestBulk.urgent = true;
  persistedStudyRequestBulk.urgentReason = 'because I said so';
  persistedStudyRequestBulk.ccEmails = ['Evan.Savage@toronto.ca'];
  persistedStudyRequestBulk = await StudyRequestBulkDAO.update(
    persistedStudyRequestBulk,
    persistedUser2,
  );
  fetchedStudyRequestBulk = await StudyRequestBulkDAO.byId(persistedStudyRequestBulk.id);
  expect(fetchedStudyRequestBulk).toEqual(persistedStudyRequestBulk);
  expect(fetchedStudyRequestBulk.lastEditorId).toEqual(persistedUser2.id);

  // update sub-request fields
  persistedStudyRequestBulk.studyRequests[0].hours = StudyHours.SCHOOL;
  persistedStudyRequestBulk.studyRequests[1].studyType = StudyType.ATR_VOLUME_BICYCLE;
  persistedStudyRequestBulk.studyRequests[1].duration = 48;
  persistedStudyRequestBulk = await StudyRequestBulkDAO.update(
    persistedStudyRequestBulk,
    persistedUser,
  );
  fetchedStudyRequestBulk = await StudyRequestBulkDAO.byId(persistedStudyRequestBulk.id);
  expect(fetchedStudyRequestBulk).toEqual(persistedStudyRequestBulk);
  expect(fetchedStudyRequestBulk.lastEditorId).toEqual(persistedUser.id);

  // delete bulk study request
  await expect(StudyRequestBulkDAO.delete(persistedStudyRequestBulk)).resolves.toBe(true);
  fetchedStudyRequestBulk = await StudyRequestBulkDAO.byId(persistedStudyRequestBulk.id);
  expect(fetchedStudyRequestBulk).toBeNull();

  // fetch using byIds
  fetchedStudyRequestsBulk = await StudyRequestBulkDAO.byIds([persistedStudyRequestBulk.id]);
  expect(fetchedStudyRequestsBulk).toEqual([]);

  // fetch all
  all = await StudyRequestBulkDAO.all();
  expect(all).not.toContainEqual(persistedStudyRequestBulk);

  // fetch study requests by bulk request
  byStudyRequestBulk = await StudyRequestDAO.byStudyRequestBulk(persistedStudyRequestBulk);
  expect(byStudyRequestBulk).toEqual([]);

  // fetch study requests by bulk requests
  byStudyRequestsBulk = await StudyRequestDAO.byStudyRequestsBulk([persistedStudyRequestBulk]);
  expect(byStudyRequestsBulk).toEqual([]);
});
