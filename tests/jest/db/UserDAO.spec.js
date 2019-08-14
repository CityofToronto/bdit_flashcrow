import db from '@/../lib/db/db';
import UserDAO from '@/../lib/db/UserDAO';
import DAOTestUtils from '@/../lib/db/test/DAOTestUtils';

const USER = {
  subject: 'foo',
  email: 'foo@toronto.ca',
  name: 'Foo Bar',
  token: 'tokenFoo',
};

const NEW_EMAIL = 'foo2@toronto.ca';
const NEW_TOKEN = 'tokenFoo2';

beforeAll(DAOTestUtils.startup);
afterAll(DAOTestUtils.shutdown);

test('UserDAO works properly', async () => {
  await expect(UserDAO.bySubject(USER.subject)).resolves.toBeNull();
  await expect(UserDAO.delete(USER)).resolves.toEqual(false);
  await expect(UserDAO.update(USER)).resolves.toEqual(false);
  const userCreated = await UserDAO.create(USER);
  expect(userCreated.subject).toEqual(USER.subject);
  await expect(UserDAO.bySubject(USER.subject)).resolves.toEqual(USER);
  Object.assign(USER, {
    email: NEW_EMAIL,
    token: NEW_TOKEN,
  });
  await expect(UserDAO.update(USER)).resolves.toEqual(true);
  await expect(UserDAO.bySubject(USER.subject)).resolves.toEqual(USER);
  await expect(UserDAO.delete(USER)).resolves.toEqual(true);
  await expect(UserDAO.bySubject(USER.subject)).resolves.toBeNull();
});

afterAll(async () => {
  db.$pool.end();
});
