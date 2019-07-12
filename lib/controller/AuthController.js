const Joi = require('@hapi/joi');
const uuid = require('uuid/v4');

const config = require('../config');
const OpenIDClient = require('../auth/OpenIDClient');
const UserDAO = require('../db/UserDAO');
const LogTag = require('../log/LogTag');

const AuthController = [];

function getRedirectUri() {
  if (config.ENV === 'production') {
    return 'https://move.intra.dev-toronto.ca/flashcrow/api/auth/openid-connect-callback';
  }
  return 'https://lvh.me:8080/flashcrow/api/auth/openid-connect-callback';
}

/**
 * GET /auth/openid-connect
 *
 * Initiates the OpenID Connect OAuth handshake by redirecting the user to the
 * authorization URL.
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
 * GET /auth/openid-connect-callback
 *
 * OpenID Connect callback URL.
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

AuthController.push({
  method: 'POST',
  path: '/auth/stub',
  options: {
    auth: false,
    plugins: {
      crumb: {
        restful: false,
      },
    },
    validate: {
      payload: {
        email: Joi.string().email().required(),
        name: Joi.string().required(),
      },
    },
  },
  handler: async (request, h) => {
    const { email, name } = request.payload;
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
    return h.redirect(config.PUBLIC_PATH);
  },
});

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
 * POST /auth/test-login
 *
 * Bypasses the OpenID Connect flow in testing, allowing us to run REST
 * API tests.
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
 * POST /auth/logout
 *
 * Logs the currently authenticated user out.
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
  },
});

module.exports = AuthController;
