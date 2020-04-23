import UserDAO from '@/lib/db/UserDAO';
import DAOTestUtils from '@/lib/test/DAOTestUtils';
import { generateUser } from '@/lib/test/random/UserGenerator';
import { initialize } from '@/web/MoveServer';

let server;

beforeAll(async () => {
  await DAOTestUtils.startupWithDevData();
  server = await initialize();
}, DAOTestUtils.TIMEOUT);
afterAll(async () => {
  await server.stop();
  await DAOTestUtils.shutdown();
}, DAOTestUtils.TIMEOUT);

test('AuthController.getAuth', async () => {
  let response = await server.inject({
    method: 'GET',
    url: '/auth',
  });
  expect(response.result).toEqual({
    csrf: response.result.csrf,
    loggedIn: false,
    user: null,
  });

  const transientUser = generateUser();
  const persistedUser = await UserDAO.create(transientUser);
  response = await server.inject({
    auth: {
      strategy: 'session',
      credentials: persistedUser,
    },
    method: 'GET',
    url: '/auth',
  });
  expect(response.result).toEqual({
    csrf: response.result.csrf,
    loggedIn: true,
    user: persistedUser,
  });
});
