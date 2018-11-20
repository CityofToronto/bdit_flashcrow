import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

function apiFetch(url, options) {
  url = `/flashcrow/api${url}`;
  options = options || {};
  Object.assign(options, {
    credentials: 'include',
  });
  return fetch(url, options)
    .then(response => response.json());
}

export default new Vuex.Store({
  state: {
    counter: 0,
    loading: false,
  },
  mutations: {
    setCounter(state, counter) {
      Vue.set(state, 'counter', counter);
    },
    startLoading(state) {
      Vue.set(state, 'loading', true);
    },
    stopLoading(state) {
      Vue.set(state, 'loading', false);
    },
  },
  actions: {
    incrementCounter({ commit }) {
      const options = {
        method: 'PUT',
      };
      commit('startLoading');
      return apiFetch('/counter', options)
        .then(({ counter }) => {
          commit('setCounter', counter);
          commit('stopLoading');
        });
    },
    init({ commit }) {
      commit('startLoading');
      return apiFetch('/counter')
        .then(({ counter }) => {
          commit('setCounter', counter);
          commit('stopLoading');
        });
    },
  },
});
