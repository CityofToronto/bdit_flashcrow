import db from '@/lib/db/db';
import StudyRequestDAO from '@/lib/db/StudyRequestDAO';
import StudyRequestBulkDAO from '@/lib/db/StudyRequestBulkDAO';
import UserDAO from '@/lib/db/UserDAO';
import StudyRequest from '@/lib/model/StudyRequest';
import StudyRequestBulk from '@/lib/model/StudyRequestBulk';
import {
  cloneStudyRequestAsTransient,
  cloneStudyRequestBulkAsTransient,
} from '@/lib/requests/RequestClone';
import {
  generateStudyRequest,
  generateStudyRequestBulk,
} from '@/lib/test/random/StudyRequestGenerator';
import { generateUser } from '@/lib/test/random/UserGenerator';

afterAll(() => {
  db.$pool.end();
});

test('RequestClone.cloneStudyRequestAsTransient [fuzz test]', async () => {
  const transientUser = generateUser();
  const persistedUser = await UserDAO.create(transientUser);
  for (let i = 0; i < 10; i++) {
    const transientStudyRequest = generateStudyRequest();
    /* eslint-disable-next-line no-await-in-loop */
    const persistedStudyRequest = await StudyRequestDAO.create(
      transientStudyRequest,
      persistedUser,
    );

    const transientStudyRequestCopy = cloneStudyRequestAsTransient(persistedStudyRequest);
    /* eslint-disable-next-line no-await-in-loop */
    await expect(
      StudyRequest.create.validateAsync(transientStudyRequestCopy),
    ).resolves.toEqual(transientStudyRequestCopy);
    expect(transientStudyRequestCopy).toEqual(transientStudyRequest);
  }
});

test('RequestClone.cloneStudyRequestBulkAsTransient [fuzz test]', async () => {
  const transientUser = generateUser();
  const persistedUser = await UserDAO.create(transientUser);
  for (let i = 0; i < 10; i++) {
    const transientStudyRequestBulk = generateStudyRequestBulk();
    /* eslint-disable-next-line no-await-in-loop */
    const persistedStudyRequestBulk = await StudyRequestBulkDAO.create(
      transientStudyRequestBulk,
      persistedUser,
    );

    const transientStudyRequestBulkCopy = cloneStudyRequestBulkAsTransient(
      persistedStudyRequestBulk,
    );
    /* eslint-disable-next-line no-await-in-loop */
    await expect(
      StudyRequestBulk.create.validateAsync(transientStudyRequestBulkCopy),
    ).resolves.toEqual(transientStudyRequestBulkCopy);

    /*
     * As the study request is persisted, it might re-order the study requests, so we have to
     * loosen the deep equality check here a bit.
     */
    const {
      studyRequests,
      ...restTransientStudyRequestBulk
    } = transientStudyRequestBulk;
    const {
      studyRequests: studyRequestsCopy,
      ...restTransientStudyRequestBulkCopy
    } = transientStudyRequestBulkCopy;
    expect(restTransientStudyRequestBulkCopy).toEqual(restTransientStudyRequestBulk);
    expect(studyRequestsCopy.length).toEqual(studyRequests.length);
    studyRequestsCopy.forEach((studyRequest) => {
      expect(studyRequests).toContainEqual(studyRequest);
    });
  }
});
