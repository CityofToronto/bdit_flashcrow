import { AuthScope } from '@/lib/Constants';
import db from '@/lib/db/db';
import SessionDAO from '@/lib/db/SessionDAO';
import UserDAO from '@/lib/db/UserDAO';
import {
  generateEmail,
  generateName,
  generateUniqueName,
  generateUser,
} from '@/lib/test/random/UserGenerator';

afterAll(() => {
  db.$pool.end();
});

test('UserDAO', async () => {
  const transientUser1 = generateUser();
  const transientUser2 = generateUser();

  await expect(UserDAO.bySub(transientUser1.sub)).resolves.toBeNull();
  await expect(UserDAO.bySub(transientUser2.sub)).resolves.toBeNull();

  const persistedUser1 = await UserDAO.create(transientUser1);
  expect(persistedUser1.sub).toEqual(transientUser1.sub);
  await expect(UserDAO.byId(persistedUser1.id)).resolves.toEqual(persistedUser1);
  await expect(UserDAO.bySub(transientUser1.sub)).resolves.toEqual(persistedUser1);
  await expect(UserDAO.bySub(transientUser2.sub)).resolves.toBeNull();
  await expect(UserDAO.byEmail(transientUser1.email)).resolves.toEqual(persistedUser1);
  await expect(UserDAO.all()).resolves.toContainEqual(persistedUser1);

  const name = generateName();
  const email = generateEmail(name);
  const uniqueName = generateUniqueName(name);
  Object.assign(persistedUser1, { email, uniqueName });
  await expect(UserDAO.update(persistedUser1)).resolves.toEqual(persistedUser1);
  Object.assign(persistedUser1, {
    scope: [AuthScope.STUDY_REQUESTS],
  });
  await expect(UserDAO.update(persistedUser1)).resolves.toEqual(persistedUser1);
  await expect(UserDAO.bySub(transientUser1.sub)).resolves.toEqual(persistedUser1);

  let users = await UserDAO.byIds([]);
  expect(users.size).toBe(0);

  users = await UserDAO.byIds([persistedUser1.id]);
  expect(users.size).toBe(1);
  expect(users.get(persistedUser1.id)).toEqual(persistedUser1);

  const persistedUser2 = await UserDAO.create(transientUser2);
  users = await UserDAO.byIds([persistedUser1.id, persistedUser2.id]);
  expect(users.size).toBe(2);
  expect(users.get(persistedUser1.id)).toEqual(persistedUser1);
  expect(users.get(persistedUser2.id)).toEqual(persistedUser2);
  await expect(UserDAO.all()).resolves.toContainEqual(persistedUser2);

  await expect(UserDAO.delete(persistedUser1)).resolves.toEqual(true);
  await expect(UserDAO.bySub(transientUser1.sub)).resolves.toBeNull();
  await expect(UserDAO.all()).resolves.not.toContainEqual(persistedUser1);
});

test('UserDAO.bySessionId', async () => {
  const transientUser = generateUser();
  const persistedUser = await UserDAO.create(transientUser);
  let session = await SessionDAO.create(persistedUser, { days: 1 });
  await expect(UserDAO.bySessionId(session.id)).resolves.toEqual(persistedUser);

  await SessionDAO.delete(session);
  await expect(UserDAO.bySessionId(session.id)).resolves.toBeNull();

  session = await SessionDAO.create(persistedUser, 0);
  await expect(UserDAO.bySessionId(session.id)).resolves.toBeNull();
});
