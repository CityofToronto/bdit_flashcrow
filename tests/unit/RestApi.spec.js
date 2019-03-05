import fs from 'fs';
import path from 'path';
import request from 'request-promise-native';

const HOST = 'https://localhost:8080';
const API_ROOT = '/flashcrow/api';
let COOKIE_JAR = request.jar(null, {
  rejectPublicSuffixes: false,
});
const ca = fs.readFileSync(path.join(__dirname, '..', '..', 'ssl', 'localhost.crt'));

function fcApi(uri, options) {
  const requestOptions = {
    ca,
    jar: COOKIE_JAR,
    json: true,
    method: 'GET',
    uri: `${HOST}${API_ROOT}${uri}`,
  };
  if (options !== undefined) {
    Object.assign(requestOptions, options);
  }
  return request(requestOptions);
}

function fcTransformGetCookie(body, response) {
  const setCookie = response.headers['set-cookie'];
  if (setCookie === undefined || setCookie.length === 0) {
    return null;
  }
  return setCookie[0];
}

function fcLogin() {
  const options = {
    json: false,
    method: 'POST',
    simple: false,
    transform: fcTransformGetCookie,
  };
  return fcApi('/auth/test-login', options)
    .then((cookie) => {
      if (cookie !== null) {
        COOKIE_JAR.setCookie(cookie, HOST);
      }
    });
}

function fcLogout() {
  const options = {
    json: false,
    simple: false,
    transform: fcTransformGetCookie,
  };
  return fcApi('/auth/logout', options)
    .then(() => {
      COOKIE_JAR = request.jar(null, {
        rejectPublicSuffixes: false,
      });
    });
}

test('authentication works', async () => {
  let response;

  response = await fcApi('/auth');
  expect(response.loggedIn).toBe(false);

  await fcLogin();
  response = await fcApi('/auth');
  expect(response.loggedIn).toBe(true);

  await fcLogout();
  response = await fcApi('/auth');
  expect(response.loggedIn).toBe(false);
});

test('counters work', async () => {
  await fcLogin();
  let response;

  response = await fcApi('/counter', { method: 'DELETE' });
  expect(response.counter).toBe(0);
  response = await fcApi('/counter');
  expect(response.counter).toBe(0);

  response = await fcApi('/counter', { method: 'PUT' });
  expect(response.counter).toBe(1);
  response = await fcApi('/counter');
  expect(response.counter).toBe(1);

  await fcApi('/counter', { method: 'PUT' });
  response = await fcApi('/counter', { method: 'PUT' });
  expect(response.counter).toBe(3);
  response = await fcApi('/counter');
  expect(response.counter).toBe(3);
});
