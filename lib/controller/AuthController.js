import Joi from '@hapi/joi';
import uuid from 'uuid/v4';

import OpenIdClient from '@/lib/auth/OpenIdClient';
import config from '@/lib/config/MoveConfig';
import UserDAO from '@/lib/db/UserDAO';
import LogTag from '@/lib/log/LogTag';

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
    validate: {
      payload: {
        nonce: Joi.string().hex().required(),
      },
    },
  },
  handler: async (request, h) => {
    const { nonce } = request.payload;

    const client = await OpenIdClient.get();
    const authorizationUrl = client.authorizationUrl(nonce);
    request.log(LogTag.DEBUG, `redirecting to: ${authorizationUrl}`);
    return h.redirect(authorizationUrl);
  },
});

/**
 * ADFS callback, used to continue the ADFS flow by exchanging the authorization code received
 * for an access token.  If valid, this access token is then upgraded to a MOVE session.
 *
 * @memberof AuthController
 * @name postAdfsCallback
 */
AuthController.push({
  method: 'POST',
  path: '/auth/adfs-callback',
  options: {
    auth: { mode: 'try' },
    plugins: {
      crumb: {
        restful: false,
      },
    },
    validate: {
      payload: {
        id_token: Joi.string().regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/),
        nonce: Joi.string().hex().required(),
      },
    },
  },
  handler: async (request, h) => {
    const client = await OpenIdClient.get();
    try {
      const tokenSet = await client.callback(request);
      if (tokenSet.expired()) {
        request.log(LogTag.ERROR, 'token expired!');
        return h.redirect('/login');
      }

      const {
        aud,
        sub,
        unique_name: uniqueName,
        upn: email,
      } = tokenSet.claims();
      /*
       * See https://auth0.com/docs/tokens/guides/id-token/validate-id-token for more details;
       * `OpenIdClient` already validates the `nonce`, but we must validate `aud` here.
       */
      if (aud !== config.openId.clientMetadata.client_id) {
        request.log(LogTag.ERROR, `invalid audience ${aud} in ADFS token!`);
        return h.redirect('/login');
      }

      /*
       * The token is valid, so upgrade it to a MOVE session.
       */
      let user = await UserDAO.bySub(sub);
      if (user === null) {
        user = {
          email,
          sub,
          uniqueName,
        };
        user = await UserDAO.create(user);
      }
      const sessionId = uuid();
      await request.server.app.cache.set(sessionId, { user }, 0);
      request.cookieAuth.set({ sessionId });

      // TODO: path redirect?
      return h.redirect(config.PUBLIC_PATH);
    } catch (err) {
      request.log(LogTag.ERROR, err);
      return h.redirect('/login');
    }
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
