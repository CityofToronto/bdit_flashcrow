import fs from 'fs';
import path from 'path';
import request from 'request-promise-native';

const HOST = 'https://localhost:8080';
const API_ROOT = '/api';
const ca = fs.readFileSync(
  path.join(__dirname, '..', '..', '..', 'ssl', 'localhost.crt'),
);

let CSRF = null;
let COOKIE_JAR;
function resetCookieJar() {
  COOKIE_JAR = request.jar();
  /* eslint-disable no-underscore-dangle */
  COOKIE_JAR._jar.rejectPublicSuffixes = false;
}
resetCookieJar();

async function fcApi(uri, options) {
  const requestOptions = {
    ca,
    jar: COOKIE_JAR,
    json: true,
    method: 'GET',
    uri: `${HOST}${API_ROOT}${uri}`,
  };
  if (CSRF !== null) {
    requestOptions.headers = {
      'X-CSRF-Token': CSRF,
    };
  }
  if (options !== undefined) {
    Object.assign(requestOptions, options);
  }
  return request(requestOptions);
}

function fcTransformGetCookies(body, response) {
  const setCookie = response.headers['set-cookie'];
  if (setCookie === undefined) {
    return [];
  }
  return setCookie;
}

async function fcLogin() {
  const { csrf } = await fcApi('/auth');
  CSRF = csrf;
  const setCookie = await fcApi('/auth/test-login', {
    json: false,
    method: 'POST',
    simple: false,
    transform: fcTransformGetCookies,
  });
  setCookie.forEach((cookie) => {
    COOKIE_JAR.setCookie(cookie, HOST);
  });
}

async function fcLogout() {
  await fcApi('/auth/logout', {
    json: false,
    simple: false,
    transform: fcTransformGetCookies,
  });
  resetCookieJar();
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
