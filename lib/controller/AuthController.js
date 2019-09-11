import Boom from '@hapi/boom';
import Joi from '@hapi/joi';
import uuid from 'uuid/v4';

import config from '../config/MoveConfig';
import OpenIDClient from '../auth/OpenIDClient';
import UserDAO from '../db/UserDAO';
import LogTag from '../log/LogTag';

/**
 * Authentication-related routes.
 *
 * @type {Array<HapiRoute>}
 */
const AuthController = [];

function getRedirectUri() {
  if (config.ENV === 'production') {
    return 'https://move.intra.dev-toronto.ca/api/auth/openid-connect-callback';
  }
  return 'https://lvh.me:8080/api/auth/openid-connect-callback';
}

/**
 * Initiates the OpenID Connect OAuth handshake by redirecting the user to the
 * authorization URL.
 *
 * @memberof AuthController
 * @name getOpenidConnect
 */
AuthController.push({
  method: 'GET',
  path: '/auth/openid-connect',
  options: {
    auth: false,
  },
  handler: async (request, h) => {
    const client = await OpenIDClient.get();
    const authorizationUrl = client.authorizationUrl({
      redirect_uri: getRedirectUri(),
      scope: 'openid email',
    });
    request.log(LogTag.DEBUG, `redirecting to: ${authorizationUrl}`);
    return h.redirect(authorizationUrl);
  },
});

/**
 * OpenID Connect callback URL.
 *
 * @memberof AuthController
 * @name getOpenidConnectCallback
 */
AuthController.push({
  method: 'GET',
  path: '/auth/openid-connect-callback',
  options: {
    auth: false,
  },
  handler: async (request, h) => {
    request.log(LogTag.DEBUG, request.query);

    // retrieve token set from OpenID Connect provider
    const client = await OpenIDClient.get();
    const tokenSet = await client.authorizationCallback(
      getRedirectUri(),
      request.query,
    );
    request.log(LogTag.DEBUG, `received and validated tokens ${JSON.stringify(tokenSet)}`);
    request.log(LogTag.DEBUG, `validated id_token claims ${JSON.stringify(tokenSet.claims)}`);

    // upgrade to application session ID
    const { sub, email } = tokenSet.claims;
    const token = tokenSet.id_token;
    let user = await UserDAO.bySubject(sub);
    if (user === null) {
      // TODO: get name as well (e.g. from email address?)
      user = {
        subject: sub, email, name: '', token,
      };
      await UserDAO.create(user);
    } else {
      Object.assign(user, { email, token });
      await UserDAO.update(user);
    }
    const sessionId = uuid();
    await request.server.app.cache.set(sessionId, { user }, 0);
    request.cookieAuth.set({ sessionId });

    // redirect to home
    return h.redirect(config.PUBLIC_PATH);
  },
});

/**
 * Stub authentication method, used as temporary solution while we prepare to integrate
 * ADFS from Cloud Services.
 *
 * TODO: remove this once ADFS is integrated
 *
 * @memberof AuthController
 * @name postStub
 */
AuthController.push({
  method: 'POST',
  path: '/auth/stub',
  options: {
    auth: { mode: 'try' },
    plugins: {
      crumb: {
        restful: false,
      },
    },
    validate: {
      payload: {
        email: Joi.string().email().required(),
        name: Joi.string().required(),
        path: Joi.string().uri({ relativeOnly: true }).default(config.PUBLIC_PATH),
      },
    },
  },
  handler: async (request, h) => {
    if (request.auth.isAuthenticated) {
      /*
       * The user is already logged in, so we should redirect them to home.
       */
      return h.redirect(config.PUBLIC_PATH);
    }
    const { email, name, path } = request.payload;
    /*
     * We must check for scheme-relative URIs here, as otherwise we'd be vulnerable
     * to open-redirect attacks:
     *
     * > Joi.string().uri({ relativeOnly: true }).validate('//evil.com');
     * { error: null,
     *   value: '//evil.com',
     *   then: [Function: then],
     *   catch: [Function: catch] }
     */
    if (path.startsWith('//')) {
      return Boom.badRequest('Scheme-relative URIs not accepted for path!');
    }
    // upgrade to application session ID
    let user = await UserDAO.byEmail(email);
    if (user === null) {
      user = {
        subject: uuid(),
        email,
        name,
        token: '',
      };
      await UserDAO.create(user);
    }
    const sessionId = uuid();
    await request.server.app.cache.set(sessionId, { user }, 0);
    request.cookieAuth.set({ sessionId });

    // redirect to home
    return h.redirect(path);
  },
});

/**
 * Gets the current authentication status.
 *
 * @memberof AuthController
 * @name get
 */
AuthController.push({
  method: 'GET',
  path: '/auth',
  options: {
    auth: { mode: 'try' },
  },
  handler: async (request, h) => {
    const csrf = request.server.plugins.crumb.generate(request, h);
    const out = {
      csrf,
      loggedIn: request.auth.isAuthenticated,
      user: null,
    };
    if (out.loggedIn) {
      const { email, name } = request.auth.credentials;
      out.user = { email, name };
    }
    return out;
  },
});

/**
 * Bypasses the OpenID Connect flow in testing, allowing us to run REST
 * API tests.
 *
 * TODO: remove this and replace with something more robust if possible
 * once ADFS is integrated
 *
 * @memberof AuthController
 * @name postTestLogin
 */
AuthController.push({
  method: 'POST',
  path: '/auth/test-login',
  options: {
    auth: false,
  },
  handler: async (request) => {
    if (config.ENV === 'production') {
      throw new Error('nope.');
    }

    // "authenticate" test user
    const sub = '0123456789';
    const email = 'flashcrow.tester@gmail.com';
    const name = 'Flashcrow Tester';
    const token = 'HEADER.PAYLOAD.SIGNATURE';
    let user = await UserDAO.bySubject(sub);
    if (user === null) {
      user = {
        subject: sub,
        email,
        name,
        token,
      };
      await UserDAO.create(user);
    } else {
      Object.assign(user, { email, name, token });
      await UserDAO.update(user);
    }
    const sessionId = uuid();
    await request.server.app.cache.set(sessionId, { user }, 0);
    request.cookieAuth.set({ sessionId });
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
      // clear session
      const { sessionId } = request.state.session;
      request.server.app.cache.drop(sessionId);
      request.cookieAuth.clear();

      // redirect home
      return h.redirect(config.PUBLIC_PATH);
    },
    plugins: {
      crumb: {
        restful: false,
      },
    },
  },
});

export default AuthController;
