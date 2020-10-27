import { HttpStatus } from '@/lib/Constants';
import config from '@/lib/config/MoveConfig';
import db from '@/lib/db/db';
import UserDAO from '@/lib/db/UserDAO';
import AuthState from '@/lib/model/AuthState';
import InjectBackendClient from '@/lib/test/api/InjectBackendClient';
import { generateUser } from '@/lib/test/random/UserGenerator';
import WebServer from '@/web/WebServer';

let server;
let client;

beforeAll(async () => {
  const webServer = new WebServer({ port: config.port });
  server = await webServer.initialize();
  client = new InjectBackendClient(server);
}, 60000);
afterAll(async () => {
  await server.stop();
  db.$pool.end();
}, 60000);

test('AuthController.getAuth', async () => {
  let response = await client.fetch('/auth');
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toEqual({
    csrf: response.result.csrf,
    loggedIn: false,
    user: null,
  });
  await expect(
    AuthState.read.validateAsync(response.result),
  ).resolves.toEqual(response.result);

  const transientUser = generateUser();
  const persistedUser = await UserDAO.create(transientUser);
  client.setUser(persistedUser);
  response = await client.fetch('/auth');
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toEqual({
    csrf: response.result.csrf,
    loggedIn: true,
    user: persistedUser,
  });
  await expect(
    AuthState.read.validateAsync(response.result),
  ).resolves.toEqual(response.result);

  client.setUser(null);
});
