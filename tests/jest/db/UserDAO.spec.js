import childProcess from 'child_process';
import path from 'path';
import util from 'util';

import db from '@/../lib/db/db';
import UserDAO from '@/../lib/db/UserDAO';

const USER = {
  subject: 'foo',
  email: 'foo@toronto.ca',
  name: 'Foo Bar',
  token: 'tokenFoo',
};

const NEW_EMAIL = 'foo2@toronto.ca';
const NEW_TOKEN = 'tokenFoo2';

// TODO: move this to some common superclass
const execFile = util.promisify(childProcess.execFile);
const GIT_ROOT = path.resolve(__dirname, '../../..');

beforeAll(async () => {
  const scriptStartup = path.resolve(GIT_ROOT, 'scripts/db/test/startup.sh');
  const { stdout } = await execFile(scriptStartup);
  console.log(stdout);
});

afterAll(async () => {
  const scriptShutdown = path.resolve(GIT_ROOT, 'scripts/db/test/shutdown.sh');
  const { stdout } = await execFile(scriptShutdown);
  console.log(stdout);
});

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
