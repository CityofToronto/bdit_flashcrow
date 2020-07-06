import store from '@/web/store';

const STORAGE_KEY_LOGIN_STATE = 'ca.toronto.move.loginState';

function restoreLoginState(next) {
  const loginState = window.sessionStorage.getItem(STORAGE_KEY_LOGIN_STATE);
  if (loginState === null) {
    return false;
  }
  window.sessionStorage.removeItem(STORAGE_KEY_LOGIN_STATE);
  try {
    const { locations, name, params } = JSON.parse(loginState);
    store.commit('setLocations', locations);
    next({ name, params });
    return true;
  } catch (err) {
    if (err instanceof SyntaxError) {
      return false;
    }
    throw err;
  }
}

function saveLoginState(to) {
  const { locations } = store.state;
  const { name, params = {} } = to;
  const loginState = JSON.stringify({ locations, name, params });
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
