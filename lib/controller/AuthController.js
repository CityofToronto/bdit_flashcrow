import { AuthScope } from '@/lib/Constants';
import OpenIdClient from '@/lib/auth/OpenIdClient';
import SessionTimeouts from '@/lib/auth/SessionTimeouts';
import config from '@/lib/config/MoveConfig';
import SessionDAO from '@/lib/db/SessionDAO';
import UserDAO from '@/lib/db/UserDAO';
import LogTag from '@/lib/log/LogTag';
import AuthState from '@/lib/model/AuthState';
import Joi from '@/lib/model/Joi';

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
  const session = await SessionDAO.create(user, { days: 1 });
  const { id: sessionId } = session;
  request.cookieAuth.set({ sessionId });
  if (user.scope.includes(AuthScope.ADMIN)) {
    request.cookieAuth.ttl(SessionTimeouts.TTL_ADMIN);
  }
  return user;
}

async function logout(request) {
  const { sessionId } = request.state.session;
  const session = await SessionDAO.byId(sessionId);
  if (session !== null) {
    await SessionDAO.delete(session);
  }
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
    description: 'Redirects to the ADFS authorization endpoint',
    plugins: {
      crumb: {
        restful: false,
      },
    },
    tags: ['api'],
  },
  handler: async (request, h) => {
    const client = await OpenIdClient.get();
    const authorizationUrl = client.authorizationUrl();
    return h.redirect(authorizationUrl);
  },
});

/**
 * ADFS callback, used to continue the ADFS flow by exchanging the authorization code received
 * for an access token.  If valid, this access token is then upgraded to a MOVE session, and
 * the user is redirected back to MOVE home.
 *
 * This method is not intended to be called directly; rather, it is intended to be called by the
 * ADFS provider with a valid authorization code signed by that provider.
 *
 * @memberof AuthController
 * @name getAdfsCallback
 * @see {@link saveLoginState}
 * @see {@link restoreLoginState}
 */
AuthController.push({
  method: 'GET',
  path: '/auth/adfs-callback',
  options: {
    auth: { mode: 'try' },
    description: 'Callback endpoint for ADFS authorization',
    tags: ['api'],
    validate: {
      query: {
        code: Joi
          .string()
          .regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/)
          .required()
          .description('Authorization code from ADFS'),
      },
    },
  },
  handler: async (request, h) => {
    const client = await OpenIdClient.get();
    try {
      const user = await client.callback(request);
      await login(request, user);
      /*
       * Before the user logs in, their navigation target page is saved using
       * `saveLoginState`.
       *
       * After login, `restoreLoginState` first checks for the existence of a `login` URL
       * query parameter.  This parameter is set here to indicate that login has successfully
       * completed.
       */
      return h.redirect(`${config.PUBLIC_PATH}?login=1`);
    } catch (err) {
      request.log(LogTag.ERROR, err);
      /*
       * Here an error has occurred in processing the user's login, so we do _not_ set the
       * `login` URL query parameter.
       */
      return h.redirect(config.PUBLIC_PATH);
    }
  },
});

/**
 * Gets the current authentication status.  Always returns a CSRF token and a flag
 * `loggedIn` that identifies whether the user is logged in.  If they are logged in,
 * additionally provides user information at `user`.
 *
 * @memberof AuthController
 * @name getAuth
 */
AuthController.push({
  method: 'GET',
  path: '/auth',
  options: {
    auth: { mode: 'try' },
    description: 'Returns the current authentication state',
    response: {
      schema: AuthState.read,
    },
    tags: ['api'],
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
 * Logs the user out if they are authenticated, then redirects them to MOVE home.
 *
 * @memberof AuthController
 * @name postLogout
 */
AuthController.push({
  method: 'POST',
  path: '/auth/logout',
  options: {
    auth: { mode: 'try' },
    description: 'Logs the active user out',
    plugins: {
      crumb: {
        restful: false,
      },
    },
    tags: ['api'],
  },
  handler: async (request, h) => {
    await logout(request);
    return h.redirect(config.PUBLIC_PATH);
  },
});

export default AuthController;
