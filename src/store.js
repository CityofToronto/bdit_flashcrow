import Vue from 'vue';
import Vuex from 'vuex';

import apiFetch from '@/lib/ApiFetch';
import SampleData from '@/lib/SampleData';

Vue.use(Vuex);

const COUNTS = SampleData.randomCounts();

function makeNewDataSelection() {
  return {
    items: [],
    meta: {},
  };
}

export default new Vuex.Store({
  state: {
    // authentication
    auth: {
      loggedIn: false,
    },
    // searching locations
    locationSuggestions: null,
    // selecting locations
    // TODO: in searching / selecting phase, generalize to other selection types
    location: null,
    // data for selected locations
    // TODO: in searching / selecting phase, generalize to collisions and other layers
    counts: COUNTS,
    // selecting data
    // TODO: in searching / selecting phase, generalize to collisions and other layers
    dataSelection: makeNewDataSelection(),
    // filtering data
    // TODO: in searching / selecting phase, bring this under one "filter" key
    filterCountTypes: [],
    filterDate: null,
    // map mode
    showMap: true,
  },
  getters: {
    dataSelectionContains: (state, getters) => (itemToFind) => {
      const i = getters.dataSelectionIndexOf(itemToFind);
      return i !== -1;
    },
    dataSelectionEmpty: state => state.dataSelection.items.length === 0,
    dataSelectionFind: (state, getters) => (itemToFind) => {
      const i = getters.dataSelectionIndexOf(itemToFind);
      if (i === -1) {
        return undefined;
      }
      return state.dataSelection.items[i];
    },
    dataSelectionIndexOf: state => itemToFind => state.dataSelection.items
      .findIndex(({ item }) => item === itemToFind),
    dataSelectionItems: state => state.dataSelection.items.map(({ item }) => item),
    dataSelectionLength: state => state.dataSelection.items.length,
  },
  mutations: {
    setAuth(state, auth) {
      Vue.set(state, 'auth', auth);
    },
    clearLocationSuggestions(state) {
      Vue.set(state, 'locationSuggestions', null);
    },
    setLocationSuggestions(state, locationSuggestions) {
      Vue.set(state, 'locationSuggestions', locationSuggestions);
    },
    clearLocation(state) {
      Vue.set(state, 'location', null);
    },
    setLocation(state, location) {
      Vue.set(state, 'location', location);
    },
    clearDataSelection(state) {
      Vue.set(state, 'dataSelection', makeNewDataSelection());
    },
    setDataSelectionMeta(state, { key, value }) {
      Vue.set(state.dataSelection.meta, key, value);
    },
    addToDataSelection(state, item) {
      state.dataSelection.items.push({
        item,
        meta: {},
      });
    },
    setDataSelectionEntryMeta(state, { entry, key, value }) {
      Vue.set(entry.meta, key, value);
    },
    removeFromDataSelection(state, i) {
      state.dataSelection.items.splice(i, 1);
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
    clearDataSelection({ commit }) {
      commit('clearDataSelection');
      return Promise.resolve();
    },
    setDataSelectionMeta({ commit }, { key, value }) {
      commit('setDataSelectionMeta', { key, value });
      return Promise.resolve();
    },
    addToDataSelection({ commit, getters }, item) {
      if (getters.dataSelectionContains(item)) {
        return Promise.reject(
          new Error('add failed: already in selection!'),
        );
      }
      commit('addToDataSelection', item);
      return Promise.resolve();
    },
    setDataSelectionItemMeta({ commit, getters }, { item, key, value }) {
      const entry = getters.dataSelectionFind(item);
      if (entry === undefined) {
        return Promise.reject(
          new Error('set meta failed: not in selection!'),
        );
      }
      commit('setDataSelectionEntryMeta', { entry, key, value });
      return Promise.resolve();
    },
    removeFromDataSelection({ commit, getters }, item) {
      const i = getters.dataSelectionIndexOf(item);
      if (i === -1) {
        return Promise.reject(
          new Error('remove failed: not in selection!'),
        );
      }
      commit('removeFromDataSelection', i);
      return Promise.resolve();
    },
  },
});
