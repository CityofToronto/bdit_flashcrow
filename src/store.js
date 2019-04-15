import Vue from 'vue';
import Vuex from 'vuex';

import apiFetch from '@/lib/ApiFetch';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // authentication
    auth: {
      loggedIn: false,
    },
    // searching locations
    location: null,
    locationSuggestions: null,
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
    clearLocation(state) {
      Vue.set(state, 'location', null);
    },
    setLocation(state, location) {
      Vue.set(state, 'location', location);
    },
    clearLocationSuggestions(state) {
      Vue.set(state, 'locationSuggestions', null);
    },
    setLocationSuggestions(state, locationSuggestions) {
      Vue.set(state, 'locationSuggestions', locationSuggestions);
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
    fetchLocation({ commit }, keyString) {
      const options = {
        data: { keyString },
      };
      return apiFetch('/cotgeocoder/findAddressCandidates', options)
        .then((location) => {
          commit('setLocation', location);
          return location;
        });
    },
    fetchLocationSuggestions({ commit }, query) {
      if (query.length < 3) {
        commit('clearLocationSuggestions');
        return Promise.resolve(null);
      }
      const options = {
        data: { q: query },
      };
      return apiFetch('/cotgeocoder/suggest', options)
        .then((locationSuggestions) => {
          commit('setLocationSuggestions', locationSuggestions);
          return locationSuggestions;
        });
    },
  },
});
