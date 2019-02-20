import db from '@/../lib/db/db';
import UserDAO from '@/../lib/db/UserDAO';

const USER = {
  subject: 'foo',
  email: 'foo@toronto.ca',
  token: 'tokenFoo',
};

test('UserDAO works properly', async () => {
  await expect(UserDAO.bySubject(USER.subject)).resolves.toBeNull();
  await expect(UserDAO.delete(USER)).resolves.toEqual(false);
  await expect(UserDAO.create(USER)).resolves.toEqual(USER.subject);
  await expect(UserDAO.bySubject(USER.subject)).resolves.toEqual(USER);
  await expect(UserDAO.delete(USER)).resolves.toEqual(true);
  await expect(UserDAO.bySubject(USER.subject)).resolves.toBeNull();
});

afterAll(async () => {
  db.$pool.end();
});
