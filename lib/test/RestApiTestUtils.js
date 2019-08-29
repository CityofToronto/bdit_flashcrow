import childProcess from 'child_process';
import fs from 'fs';
import path from 'path';
import request from 'request-promise-native';
import util from 'util';

import db from '@/../lib/db/db';

const execFile = util.promisify(childProcess.execFile);
const GIT_ROOT = path.resolve(__dirname, '../..');

// SSL CONFIGURATION

const HOST = 'https://localhost:8080';
const ca = fs.readFileSync(
  path.join(__dirname, '..', '..', 'ssl', 'localhost.crt'),
);

// COOKIE HANDLING

let CSRF = null;
let COOKIE_JAR;
function resetCookieJar() {
  COOKIE_JAR = request.jar();
  /* eslint-disable no-underscore-dangle */
  COOKIE_JAR._jar.rejectPublicSuffixes = false;
}
resetCookieJar();

function transformGetCookies(body, response) {
  const setCookie = response.headers['set-cookie'];
  if (setCookie === undefined) {
    return [];
  }
  return setCookie;
}

// FRONTEND / BACKEND STATE

class RestApiTestUtils {
  // TEST LIFECYCLE

  static async startup() {
    const scriptStartup = path.resolve(GIT_ROOT, 'scripts/test/api/startup.sh');
    const { stdout } = await execFile(scriptStartup);
    console.log(stdout);
  }

  static async shutdown() {
    db.$pool.end();
    const scriptShutdown = path.resolve(GIT_ROOT, 'scripts/test/api/shutdown.sh');
    const { stdout } = await execFile(scriptShutdown);
    console.log(stdout);
  }

  // API WRAPPER

  static async callApi(uri, options) {
    const requestOptions = {
      ca,
      getCookies: false,
      jar: COOKIE_JAR,
      json: true,
      method: 'GET',
      uri: `${HOST}${uri}`,
    };
    if (CSRF !== null) {
      requestOptions.headers = {
        'X-CSRF-Token': CSRF,
      };
    }
    if (options !== undefined) {
      Object.assign(requestOptions, options);
      const { getCookies } = requestOptions;
      delete requestOptions.getCookies;
      if (getCookies) {
        requestOptions.transform = transformGetCookies;
      }
    }
    return request(requestOptions);
  }

  // AUTHENTICATION
  static async login() {
    const { csrf } = await RestApiTestUtils.callApi('/auth');
    CSRF = csrf;
    const setCookie = await RestApiTestUtils.callApi('/auth/test-login', {
      getCookies: true,
      json: false,
      method: 'POST',
      simple: false,
    });
    setCookie.forEach((cookie) => {
      COOKIE_JAR.setCookie(cookie, HOST);
    });
  }

  static async logout() {
    await RestApiTestUtils.callApi('/auth/logout', {
      getCookies: true,
      json: false,
      simple: false,
    });
    resetCookieJar();
  }
}
RestApiTestUtils.TIMEOUT = 60000;

export default RestApiTestUtils;
