import Vue from 'vue';
import Vuex from 'vuex';

import apiFetch from '@/lib/ApiFetch';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    counter: 0,
    // authentication
    auth: {
      loggedIn: false,
    },
    // searching
    query: '',
    // filtering
    filterCountTypes: [],
    filterDate: null,
    // map mode
    showMap: true,
  },
  mutations: {
    setAuth(state, auth) {
      Vue.set(state, 'auth', auth);
    },
    setCounter(state, counter) {
      Vue.set(state, 'counter', counter);
    },
    setQuery(state, query) {
      Vue.set(state, 'query', query);
    },
    setFilterCountTypes(state, filterCountTypes) {
      Vue.set(state, 'filterCountTypes', filterCountTypes);
    },
    setFilterDate(state, filterDate) {
      Vue.set(state, 'filterDate', filterDate);
    },
    setShowMap(state, showMap) {
      Vue.set(state, 'showMap', showMap);
    },
  },
  actions: {
    checkAuth({ commit }) {
      return apiFetch('/auth')
        .then((auth) => {
          commit('setAuth', auth);
          return auth;
        });
    },
    incrementCounter({ commit }) {
      const options = {
        method: 'PUT',
      };
      return apiFetch('/counter', options)
        .then(({ counter }) => {
          commit('setCounter', counter);
          return counter;
        });
    },
    init({ commit }) {
      return apiFetch('/counter')
        .then(({ counter }) => {
          commit('setCounter', counter);
          return counter;
        });
    },
    resetCounter({ commit }) {
      const options = {
        method: 'DELETE',
      };
      return apiFetch('/counter', options)
        .then(({ counter }) => {
          commit('setCounter', counter);
          return counter;
        });
    },
  },
});
