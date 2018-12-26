import Vue from 'vue';
import Vuex from 'vuex';

import apiFetch from '@/lib/ApiFetch';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    counter: 0,
    loading: false,
    auth: {
      loggedIn: false,
    },
  },
  mutations: {
    setAuth(state, auth) {
      Vue.set(state, 'auth', auth);
    },
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
    checkAuth({ commit }) {
      commit('startLoading');
      return apiFetch('/auth')
        .then((auth) => {
          commit('setAuth', auth);
          commit('stopLoading');
          return auth;
        });
    },
    incrementCounter({ commit }) {
      const options = {
        method: 'PUT',
      };
      commit('startLoading');
      return apiFetch('/counter', options)
        .then(({ counter }) => {
          commit('setCounter', counter);
          commit('stopLoading');
          return counter;
        });
    },
    init({ commit }) {
      commit('startLoading');
      return apiFetch('/counter')
        .then(({ counter }) => {
          commit('setCounter', counter);
          commit('stopLoading');
          return counter;
        });
    },
    resetCounter({ commit }) {
      const options = {
        method: 'DELETE',
      };
      commit('startLoading');
      return apiFetch('/counter', options)
        .then(({ counter }) => {
          commit('setCounter', counter);
          commit('stopLoading');
          return counter;
        });
    },
  },
});
