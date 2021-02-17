const STORAGE_KEY_LOGIN_STATE = 'ca.toronto.move.loginState';

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
