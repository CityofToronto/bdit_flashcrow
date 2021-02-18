const STORAGE_KEY_LOGIN_STATE = 'ca.toronto.move.loginState';

/**
 * Restores the navigation target saved by {@link saveLoginState}.  This is intended to
 * be used after login.  If the user successfully logged in _and_ a valid navigation target
 * is available in `sessionStorage`, this results in one of two actions:
 *
 * 1. when the user used the bottom-right menu to log in, to return them to the page they were on;
 * 2. when the user clicked a button or link that takes them to a page they must log in to
 *    access, to complete navigation to that page.
 *
 * @param {Function} next - `next` method from `vue-router` navigation guards
 * @returns {boolean} whether conditions to restore a navigation target were met
 */
function restoreLoginState(next) {
  const urlParams = new URLSearchParams(window.location.search);
  const paramLogin = urlParams.get('login');
  if (paramLogin === null) {
    /*
     * To prevent infinite redirects from login, we only restore this state when
     * the `login` URL query parameter is set.  In turn, `AuthController` only sets
     * this parameter when the login flow succeeds.
     */
    return false;
  }

  const loginState = window.sessionStorage.getItem(STORAGE_KEY_LOGIN_STATE);
  if (loginState === null) {
    /*
     * If there is no login state stored in `sessionStorage`, we cannot restore it!
     */
    return false;
  }
  window.sessionStorage.removeItem(STORAGE_KEY_LOGIN_STATE);
  try {
    const { name, params } = JSON.parse(loginState);
    next({ name, params });
    return true;
  } catch (err) {
    if (err instanceof SyntaxError) {
      /*
       * If the login state does not contain valid JSON, we cannot restore it!
       */
      return false;
    }
    throw err;
  }
}

/**
 * Saves the given navigation target to `sessionStorage`.  This is intended to be called
 * before login, and is used in one of two ways:
 *
 * 1. when the user uses the bottom-right menu to log in, to save their current page;
 * 2. when the user clicks a button or link that takes them to a page they must log in to
 *    access, to save that page.
 *
 * This navigation target is saved to `sessionStorage`, to be restored by
 * {@link restoreLoginState} after login.
 *
 * @param {Object} to - navigation target
 */
function saveLoginState(to) {
  const { name, params = {} } = to;
  const loginState = JSON.stringify({ name, params });
  window.sessionStorage.setItem(STORAGE_KEY_LOGIN_STATE, loginState);
}

const LoginState = {
  restoreLoginState,
  saveLoginState,
};

export {
  LoginState as default,
  restoreLoginState,
  saveLoginState,
};
