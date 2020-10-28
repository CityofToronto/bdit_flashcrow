import { AuthScope, HttpStatus } from '@/lib/Constants';
import config from '@/lib/config/MoveConfig';
import db from '@/lib/db/db';
import UserDAO from '@/lib/db/UserDAO';
import InjectBackendClient from '@/lib/test/api/InjectBackendClient';
import { generateUser } from '@/lib/test/random/UserGenerator';
import DateTime from '@/lib/time/DateTime';
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

test('UserController.getUsers', async () => {
  // cannot use anonymously
  client.setUser(null);
  let response = await client.fetch('/users');
  expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED.statusCode);

  const transientUser1 = generateUser();
  const persistedUser1 = await UserDAO.create(transientUser1);

  client.setUser(persistedUser1);
  response = await client.fetch('/users');
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toContainEqual(persistedUser1);

  const transientUser2 = generateUser();
  const persistedUser2 = await UserDAO.create(transientUser2);

  response = await client.fetch('/users');
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toContainEqual(persistedUser1);
  expect(response.result).toContainEqual(persistedUser2);
});

test('UserController.getUsersByIds', async () => {
  const transientUser1 = generateUser();
  const persistedUser1 = await UserDAO.create(transientUser1);

  // cannot use anonymously
  client.setUser(null);
  let data = { id: [persistedUser1.id + 1000] };
  let response = await client.fetch('/users/byId', { data });
  expect(response.statusCode).toBe(HttpStatus.UNAUTHORIZED.statusCode);

  client.setUser(persistedUser1);
  data = { id: [persistedUser1.id + 1000] };
  response = await client.fetch('/users/byId', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  let users = new Map(response.result);
  expect(users.has(-1)).toBe(false);

  data = { id: [persistedUser1.id] };
  response = await client.fetch('/users/byId', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  users = new Map(response.result);
  expect(users.get(persistedUser1.id)).toEqual(persistedUser1);

  const transientUser2 = generateUser();
  const persistedUser2 = await UserDAO.create(transientUser2);

  data = { id: [persistedUser2.id] };
  response = await client.fetch('/users/byId', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  users = new Map(response.result);
  expect(users.has(persistedUser1.id)).toBe(false);
  expect(users.get(persistedUser2.id)).toEqual(persistedUser2);

  data = { id: [persistedUser1.id, persistedUser2.id] };
  response = await client.fetch('/users/byId', { data });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  users = new Map(response.result);
  expect(users.get(persistedUser1.id)).toEqual(persistedUser1);
  expect(users.get(persistedUser2.id)).toEqual(persistedUser2);
});

test('UserController.putUser', async () => {
  const transientAdmin = generateUser([AuthScope.ADMIN]);
  const admin = await UserDAO.create(transientAdmin);

  const transientUser = generateUser();
  const user = await UserDAO.create(transientUser);

  // non-admin users cannot change their own details!
  client.setUser(user);
  user.scope = [AuthScope.STUDY_REQUESTS, AuthScope.STUDY_REQUESTS_ADMIN];
  let response = await client.fetch(`/users/${user.id}`, {
    method: 'PUT',
    data: user,
  });
  expect(response.statusCode).toBe(HttpStatus.FORBIDDEN.statusCode);

  // cannot update non-existent user
  client.setUser(admin);
  response = await client.fetch(`/users/${user.id + 1000}`, {
    method: 'PUT',
    data: user,
  });
  expect(response.statusCode).toBe(HttpStatus.NOT_FOUND.statusCode);

  // admin users can update other users' details
  response = await client.fetch(`/users/${user.id}`, {
    method: 'PUT',
    data: user,
  });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toEqual(user);

  // ID of payload user must match URL
  // admin users can update other users' details
  response = await client.fetch(`/users/${user.id}`, {
    method: 'PUT',
    data: admin,
  });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);

  // cannot update user ID
  response = await client.fetch(`/users/${user.id}`, {
    method: 'PUT',
    data: {
      ...user,
      id: user.id + 1,
    },
  });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);

  // cannot update createdAt timestamp
  response = await client.fetch(`/users/${user.id}`, {
    method: 'PUT',
    data: {
      ...user,
      createdAt: DateTime.local(),
    },
  });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);

  // cannot update sub
  response = await client.fetch(`/users/${user.id}`, {
    method: 'PUT',
    data: {
      ...user,
      sub: 'argle bargle',
    },
  });
  expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST.statusCode);

  // admin can give others ADMIN privileges
  user.scope = [AuthScope.STUDY_REQUESTS, AuthScope.STUDY_REQUESTS_ADMIN, AuthScope.ADMIN];
  response = await client.fetch(`/users/${user.id}`, {
    method: 'PUT',
    data: user,
  });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toEqual(user);

  // now that the other user is an admin, they can change themselves!
  client.setUser(user);
  user.scope = [AuthScope.STUDY_REQUESTS, AuthScope.ADMIN];
  response = await client.fetch(`/users/${user.id}`, {
    method: 'PUT',
    data: user,
  });
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.result).toEqual(user);
});
