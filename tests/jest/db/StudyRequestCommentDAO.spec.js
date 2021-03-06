import db from '@/lib/db/db';
import StudyRequestDAO from '@/lib/db/StudyRequestDAO';
import StudyRequestCommentDAO from '@/lib/db/StudyRequestCommentDAO';
import UserDAO from '@/lib/db/UserDAO';
import StudyRequestComment from '@/lib/model/StudyRequestComment';
import { generateStudyRequest } from '@/lib/test/random/StudyRequestGenerator';
import { generateUser } from '@/lib/test/random/UserGenerator';

afterAll(() => {
  db.$pool.end();
});

test('StudyRequestCommentDAO', async () => {
  await expect(StudyRequestCommentDAO.byId(-1)).resolves.toBeNull();

  const user1 = generateUser();
  const userCreated1 = await UserDAO.create(user1);
  const transientStudyRequest = generateStudyRequest();
  const persistedStudyRequest = await StudyRequestDAO.create(transientStudyRequest, userCreated1);

  const user2 = generateUser();
  const userCreated2 = await UserDAO.create(user2);

  const transientComment1 = {
    comment: 'We don\'t normally do this study here.',
  };
  const transientComment2 = {
    comment: 'I believe we have already done this study before.',
  };

  // save comment 1
  let persistedComment1 = await StudyRequestCommentDAO.create(
    transientComment1,
    persistedStudyRequest,
    userCreated1,
  );
  expect(persistedComment1.id).not.toBeNull();
  await expect(
    StudyRequestComment.read.validateAsync(persistedComment1),
  ).resolves.toEqual(persistedComment1);

  // fetch saved comment
  let fetchedComment1 = await StudyRequestCommentDAO.byId(persistedComment1.id);
  expect(fetchedComment1).toEqual(persistedComment1);

  // fetch by study request
  let byStudyRequest = await StudyRequestCommentDAO.byStudyRequest(persistedStudyRequest);
  expect(byStudyRequest).toEqual([persistedComment1]);

  // update comment
  persistedComment1.comment = 'Yes, we\'ve done this already here.';
  persistedComment1 = await StudyRequestCommentDAO.update(persistedComment1);
  fetchedComment1 = await StudyRequestCommentDAO.byId(persistedComment1.id);
  expect(fetchedComment1).toEqual(persistedComment1);

  // save comment 2
  const persistedComment2 = await StudyRequestCommentDAO.create(
    transientComment2,
    persistedStudyRequest,
    userCreated2,
  );
  expect(persistedComment2.id).not.toBeNull();

  // fetch by study request: returns most recent first
  byStudyRequest = await StudyRequestCommentDAO.byStudyRequest(persistedStudyRequest);
  expect(byStudyRequest).toEqual([persistedComment2, persistedComment1]);

  // delete comment 1
  await expect(StudyRequestCommentDAO.delete(persistedComment1)).resolves.toBe(true);
  byStudyRequest = await StudyRequestCommentDAO.byStudyRequest(persistedStudyRequest);
  expect(byStudyRequest).toEqual([persistedComment2]);

  // delete comment 1: should not work again
  await expect(StudyRequestCommentDAO.delete(persistedComment1)).resolves.toBe(false);

  // delete study request: should delete all comments
  await StudyRequestDAO.delete(persistedStudyRequest);
  byStudyRequest = await StudyRequestCommentDAO.byStudyRequest(persistedStudyRequest);
  expect(byStudyRequest).toEqual([]);
});
