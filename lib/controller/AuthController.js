import Boom from '@hapi/boom';
import { v4 as uuidv4 } from 'uuid';
import Joi from '@/lib/model/Joi';

import { AuthScope } from '@/lib/Constants';
import OpenIdClient from '@/lib/auth/OpenIdClient';
import config from '@/lib/config/MoveConfig';
import UserDAO from '@/lib/db/UserDAO';
import LogTag from '@/lib/log/LogTag';
import AuthState from '@/lib/model/AuthState';
import User from '@/lib/model/User';
import { generateUser } from '@/lib/test/random/UserGenerator';

async function login(request, { email, sub, uniqueName }) {
  let user = await UserDAO.bySub(sub);
  if (user === null) {
    user = {
      email,
      scope: [AuthScope.STUDY_REQUESTS],
      sub,
      uniqueName,
    };
    user = await UserDAO.create(user);
  }
  const sessionId = uuidv4();
  await request.server.app.cache.set(sessionId, { user }, 0);
  request.cookieAuth.set({ sessionId });
  return user;
}

async function logout(request) {
  const { sessionId } = request.state.session;
  request.server.app.cache.drop(sessionId);
  request.cookieAuth.clear();
}

/**
 * Authentication-related routes.
 *
 * @type {Array<HapiRoute>}
 */
const AuthController = [];

/**
 * Start the ADFS flow by redirecting to the authorization endpoint, where the user will
 * log in.
 *
 * @memberof AuthController
 * @name getAdfsInit
 */
AuthController.push({
  method: 'POST',
  path: '/auth/adfs-init',
  options: {
    auth: { mode: 'try' },
    plugins: {
      crumb: {
        restful: false,
      },
    },
  },
  handler: async (request, h) => {
    const client = await OpenIdClient.get();
    const authorizationUrl = client.authorizationUrl();
    return h.redirect(authorizationUrl);
  },
});

/**
 * ADFS callback, used to continue the ADFS flow by exchanging the authorization code received
 * for an access token.  If valid, this access token is then upgraded to a MOVE session.
 *
 * @memberof AuthController
 * @name getAdfsCallback
 */
AuthController.push({
  method: 'GET',
  path: '/auth/adfs-callback',
  options: {
    auth: { mode: 'try' },
    validate: {
      query: {
        code: Joi.string().regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/).required(),
      },
    },
  },
  handler: async (request, h) => {
    const client = await OpenIdClient.get();
    try {
      const user = await client.callback(request);
      await login(request, user);
      return h.redirect(config.PUBLIC_PATH);
    } catch (err) {
      request.log(LogTag.ERROR, err);
      return h.redirect('/');
    }
  },
});

/**
 * Gets the current authentication status.
 *
 * @memberof AuthController
 * @name getAuth
 */
AuthController.push({
  method: 'GET',
  path: '/auth',
  options: {
    auth: { mode: 'try' },
    response: {
      schema: AuthState.read,
    },
  },
  handler: async (request, h) => {
    const csrf = request.server.plugins.crumb.generate(request, h);
    const out = {
      csrf,
      loggedIn: request.auth.isAuthenticated,
      user: null,
    };
    if (out.loggedIn) {
      out.user = request.auth.credentials;
    }
    return out;
  },
});

/**
 * Logs the currently authenticated user out.
 *
 * @memberof AuthController
 * @name postLogout
 */
AuthController.push({
  method: 'POST',
  path: '/auth/logout',
  options: {
    handler: async (request, h) => {
      await logout(request);
      return h.redirect(config.PUBLIC_PATH);
    },
    plugins: {
      crumb: {
        restful: false,
      },
    },
  },
});

/**
 * Bypasses the OpenID Connect flow in testing, allowing us to run REST
 * API tests.
 *
 * @memberof AuthController
 * @name postTestLogin
 */
AuthController.push({
  method: 'POST',
  path: '/auth/test-login',
  options: {
    auth: false,
    response: {
      schema: User.read,
    },
  },
  handler: async (request) => {
    if (config.ENV !== 'test') {
      return Boom.forbidden('cannot access test login endpoint in non-test environment!');
    }
    let user = generateUser();
    user = await login(request, user);
    return user;
  },
});

export default AuthController;
