import { StudyRequestStatus } from '@/lib/Constants';
import db from '@/lib/db/db';
import StudyRequestDAO from '@/lib/db/StudyRequestDAO';
import StudyRequestChangeDAO from '@/lib/db/StudyRequestChangeDAO';
import UserDAO from '@/lib/db/UserDAO';
import StudyRequestChange from '@/lib/model/StudyRequestChange';
import { generateStudyRequest } from '@/lib/test/random/StudyRequestGenerator';
import { generateUser } from '@/lib/test/random/UserGenerator';

afterAll(() => {
  db.$pool.end();
});

test('StudyRequestChangeDAO', async () => {
  await expect(StudyRequestChangeDAO.byId(-1)).resolves.toBeNull();

  const transientUser1 = generateUser();
  const persistedUser1 = await UserDAO.create(transientUser1);
  const transientStudyRequest = generateStudyRequest();
  const persistedStudyRequest = await StudyRequestDAO.create(
    transientStudyRequest,
    persistedUser1,
  );

  const transientUser2 = generateUser();
  const persistedUser2 = await UserDAO.create(transientUser2);

  // save change 1
  persistedStudyRequest.status = StudyRequestStatus.CHANGES_NEEDED;
  const persistedChange1 = await StudyRequestChangeDAO.create(
    persistedStudyRequest,
    persistedUser1,
  );
  expect(persistedChange1.id).not.toBeNull();
  await expect(
    StudyRequestChange.read.validateAsync(persistedChange1),
  ).resolves.toEqual(persistedChange1);

  // fetch saved change
  const fetchedChange1 = await StudyRequestChangeDAO.byId(persistedChange1.id);
  expect(fetchedChange1).toEqual(persistedChange1);

  // fetch by study request
  let byStudyRequest = await StudyRequestChangeDAO.byStudyRequest(persistedStudyRequest);
  expect(byStudyRequest).toEqual([persistedChange1]);

  // save change 2
  persistedStudyRequest.status = StudyRequestStatus.ASSIGNED;
  const persistedChange2 = await StudyRequestChangeDAO.create(
    persistedStudyRequest,
    persistedUser2,
  );
  expect(persistedChange2.id).not.toBeNull();

  // fetch by study request: returns most recent first
  byStudyRequest = await StudyRequestChangeDAO.byStudyRequest(persistedStudyRequest);
  expect(byStudyRequest).toEqual([persistedChange2, persistedChange1]);

  // delete study request: should delete all changes
  await StudyRequestDAO.delete(persistedStudyRequest);
  byStudyRequest = await StudyRequestChangeDAO.byStudyRequest(persistedStudyRequest);
  expect(byStudyRequest).toEqual([]);
});
