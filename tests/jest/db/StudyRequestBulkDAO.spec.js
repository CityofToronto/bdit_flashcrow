import { StudyHours, StudyType } from '@/lib/Constants';
import db from '@/lib/db/db';
import StudyRequestDAO from '@/lib/db/StudyRequestDAO';
import StudyRequestBulkDAO from '@/lib/db/StudyRequestBulkDAO';
import UserDAO from '@/lib/db/UserDAO';
import StudyRequestBulk from '@/lib/model/StudyRequestBulk';
import { generateStudyRequestBulk } from '@/lib/test/random/StudyRequestGenerator';
import { generateUser } from '@/lib/test/random/UserGenerator';

afterAll(() => {
  db.$pool.end();
});

test('StudyRequestBulkDAO', async () => {
  const transientUser = generateUser();
  const persistedUser = await UserDAO.create(transientUser);

  const transientStudyRequestBulk = generateStudyRequestBulk();

  // save bulk study request
  let persistedStudyRequestBulk = await StudyRequestBulkDAO.create(
    transientStudyRequestBulk,
    persistedUser,
  );
  expect(persistedStudyRequestBulk.id).not.toBeNull();
  expect(persistedStudyRequestBulk.userId).toBe(persistedUser.id);
  persistedStudyRequestBulk.studyRequests.forEach((studyRequest) => {
    expect(studyRequest.userId).toBe(persistedUser.id);
    expect(studyRequest.studyRequestBulkId).toBe(persistedStudyRequestBulk.id);
  });
  await expect(
    StudyRequestBulk.read.validateAsync(persistedStudyRequestBulk),
  ).resolves.toEqual(persistedStudyRequestBulk);

  // fetch saved bulk study request
  let fetchedStudyRequestBulk = await StudyRequestBulkDAO.byId(persistedStudyRequestBulk.id);
  expect(fetchedStudyRequestBulk).toEqual(persistedStudyRequestBulk);

  // fetch using byIds
  let fetchedStudyRequestsBulk = await StudyRequestBulkDAO.byIds([persistedStudyRequestBulk.id]);
  expect(fetchedStudyRequestsBulk).toEqual([persistedStudyRequestBulk]);

  // fetch study requests by bulk request
  let byStudyRequestBulk = await StudyRequestDAO.byStudyRequestBulk(persistedStudyRequestBulk);
  expect(byStudyRequestBulk).toEqual(persistedStudyRequestBulk.studyRequests);

  // fetch study requests by bulk requests
  let byStudyRequestsBulk = await StudyRequestDAO.byStudyRequestsBulk([persistedStudyRequestBulk]);
  expect(byStudyRequestsBulk).toEqual(persistedStudyRequestBulk.studyRequests);

  // update existing bulk request fields
  persistedStudyRequestBulk.name = 'new and improved bulk study request';
  persistedStudyRequestBulk = await StudyRequestBulkDAO.update(persistedStudyRequestBulk);
  fetchedStudyRequestBulk = await StudyRequestBulkDAO.byId(persistedStudyRequestBulk.id);
  expect(fetchedStudyRequestBulk).toEqual(persistedStudyRequestBulk);

  // get rid of ccEmails
  persistedStudyRequestBulk.ccEmails = [];
  persistedStudyRequestBulk = await StudyRequestBulkDAO.update(persistedStudyRequestBulk);
  fetchedStudyRequestBulk = await StudyRequestBulkDAO.byId(persistedStudyRequestBulk.id);
  expect(fetchedStudyRequestBulk).toEqual(persistedStudyRequestBulk);

  // add ccEmails
  persistedStudyRequestBulk.ccEmails = ['Evan.Savage@toronto.ca'];
  persistedStudyRequestBulk = await StudyRequestBulkDAO.update(persistedStudyRequestBulk);
  fetchedStudyRequestBulk = await StudyRequestBulkDAO.byId(persistedStudyRequestBulk.id);
  expect(fetchedStudyRequestBulk).toEqual(persistedStudyRequestBulk);

  // update sub-request fields
  persistedStudyRequestBulk.studyRequests[0].studyType = StudyType.TMC;
  persistedStudyRequestBulk.studyRequests[0].studyTypeOther = null;
  persistedStudyRequestBulk.studyRequests[0].duration = null;
  persistedStudyRequestBulk.studyRequests[0].hours = StudyHours.SCHOOL;

  persistedStudyRequestBulk.studyRequests[1].studyType = StudyType.ATR_VOLUME_BICYCLE;
  persistedStudyRequestBulk.studyRequests[1].studyTypeOther = null;
  persistedStudyRequestBulk.studyRequests[1].duration = 48;
  persistedStudyRequestBulk.studyRequests[1].hours = null;

  persistedStudyRequestBulk = await StudyRequestBulkDAO.update(persistedStudyRequestBulk);
  fetchedStudyRequestBulk = await StudyRequestBulkDAO.byId(persistedStudyRequestBulk.id);
  expect(fetchedStudyRequestBulk).toEqual(persistedStudyRequestBulk);

  // delete bulk study request
  await expect(StudyRequestBulkDAO.delete(persistedStudyRequestBulk)).resolves.toBe(true);
  fetchedStudyRequestBulk = await StudyRequestBulkDAO.byId(persistedStudyRequestBulk.id);
  expect(fetchedStudyRequestBulk).toBeNull();

  // fetch using byIds
  fetchedStudyRequestsBulk = await StudyRequestBulkDAO.byIds([persistedStudyRequestBulk.id]);
  expect(fetchedStudyRequestsBulk).toEqual([]);

  // fetch study requests by bulk request
  byStudyRequestBulk = await StudyRequestDAO.byStudyRequestBulk(persistedStudyRequestBulk);
  expect(byStudyRequestBulk).toEqual([]);

  // fetch study requests by bulk requests
  byStudyRequestsBulk = await StudyRequestDAO.byStudyRequestsBulk([persistedStudyRequestBulk]);
  expect(byStudyRequestsBulk).toEqual([]);
});
