import { v4 as uuidv4 } from 'uuid';

import { HttpStatus } from '@/lib/Constants';
import config from '@/lib/config/MoveConfig';
import db from '@/lib/db/db';
import UserDAO from '@/lib/db/UserDAO';
import InjectBackendClient from '@/lib/test/api/InjectBackendClient';
import { generateUser } from '@/lib/test/random/UserGenerator';
import storageStrategy from '@/lib/io/storage/StorageStrategy';
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

test('StorageController.getStorage', async () => {
  const transientUser = generateUser();
  const persistedUser = await UserDAO.create(transientUser);
  client.setUser(persistedUser);

  const namespace = 'test';
  const uuid = uuidv4();
  const key = `StorageController-${uuid}.csv`;

  let response = await client.fetch(`/storage/${namespace}/${key}`);
  expect(response.statusCode).toBe(HttpStatus.NOT_FOUND.statusCode);

  const value = 'a,b\n42,foo';
  const bufValue = Buffer.from(value);
  await storageStrategy.put(namespace, key, bufValue);

  response = await client.fetch(`/storage/${namespace}/${key}`);
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.headers['content-type']).toEqual('text/csv; charset=utf-8');
  expect(response.result).toEqual(value);

  await storageStrategy.delete(namespace, key);
  response = await client.fetch(`/storage/${namespace}/${key}`);
  expect(response.statusCode).toBe(HttpStatus.NOT_FOUND.statusCode);
});

test('StorageController.getStorage [no extension]', async () => {
  const transientUser = generateUser();
  const persistedUser = await UserDAO.create(transientUser);
  client.setUser(persistedUser);

  const namespace = 'test';
  const uuid = uuidv4();
  const key = `StorageController-${uuid}`;
  const value = 'a,b\n42,foo';
  const bufValue = Buffer.from(value);
  await storageStrategy.put(namespace, key, bufValue);

  const response = await client.fetch(`/storage/${namespace}/${key}`);
  expect(response.statusCode).toBe(HttpStatus.OK.statusCode);
  expect(response.headers['content-type']).toEqual('application/octet-stream');
  expect(response.result).toEqual(value);

  await storageStrategy.delete(namespace, key);
});
