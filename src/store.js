import Vue from 'vue';
import Vuex from 'vuex';

import apiFetch from '@/lib/ApiFetch';
import Constants from '@/lib/Constants';
import SampleData from '@/lib/SampleData';

Vue.use(Vuex);

const COUNTS = SampleData.randomCounts();

function makeStudyItem(studyType) {
  return {
    item: studyType,
    meta: {
      dateRange: null,
      daysOfWeek: [2, 3, 4],
      duration: 24,
      hours: 'ROUTINE',
      notes: '',
    },
  };
}

export default new Vuex.Store({
  state: {
    // modal
    modal: null,
    // time
    now: new Date(),
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
    // FILTERING DATA
    // TODO: in searching / selecting phase, bring this under one "filter" key
    filterCountTypes: [...Constants.COUNT_TYPES.keys()],
    filterDate: null,
    // map mode
    showMap: true,
    // ACTIVE STUDY REQUEST
    studyRequest: null,
    // query that will appear in the search bar
    locationQuery: '',
  },
  getters: {
    // FILTERING DATA
    hasFilters(state, getters) {
      return getters.hasFilterCountTypes || state.filterDate !== null;
    },
    hasFilterCountTypes(state) {
      return state.filterCountTypes.length !== Constants.COUNT_TYPES.length;
    },
    // ACTIVE STUDY REQUEST
    studyTypesUnselectedFirst(state) {
      if (state.studyRequest === null) {
        return Constants.COUNT_TYPES;
      }
      const studyTypesSelectedSet = new Set(
        state.studyRequest.items.map(({ item }) => item),
      );
      const studyTypesUnselected = [];
      const studyTypesSelected = [];
      Constants.COUNT_TYPES.forEach((countType) => {
        if (studyTypesSelectedSet.has(countType.value)) {
          studyTypesSelected.push(countType);
        } else {
          studyTypesUnselected.push(countType);
        }
      });
      return studyTypesUnselected.concat(studyTypesSelected);
    },
  },
  mutations: {
    clearModal(state) {
      Vue.set(state, 'modal', null);
    },
    setModal(state, modal) {
      Vue.set(state, 'modal', modal);
    },
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
    setLocationQuery(state, locationQuery) {
      Vue.set(state, 'locationQuery', locationQuery);
    },
    // FILTERING DATA
    clearFilters(state) {
      Vue.set(state, 'filterCountTypes', [...Constants.COUNT_TYPES.keys()]);
      Vue.set(state, 'filterDate', null);
    },
    setFilterCountTypes(state, filterCountTypes) {
      Vue.set(state, 'filterCountTypes', filterCountTypes);
    },
    setFilterDate(state, filterDate) {
      Vue.set(state, 'filterDate', filterDate);
    },
    // MAP MODE
    setShowMap(state, showMap) {
      Vue.set(state, 'showMap', showMap);
    },
    // ACTIVE STUDY REQUEST
    clearStudyRequest(state) {
      Vue.set(state, 'studyRequest', null);
    },
    setNewStudyRequest(state, studyTypes) {
      const meta = {
        hasServiceRequestId: null,
        serviceRequestId: null,
        priority: null,
        dueDate: null,
        reasons: [],
        ccEmails: [],
      };
      const items = studyTypes.map(makeStudyItem);
      Vue.set(state, 'studyRequest', { items, meta });
    },
    addStudyToStudyRequest(state, studyType) {
      const item = makeStudyItem(studyType);
      state.studyRequest.items.push(item);
    },
    removeStudyFromStudyRequest(state, i) {
      state.studyRequest.items.splice(i, 1);
    },
    setStudyRequestMeta(state, { key, value }) {
      Vue.set(state.studyRequest.meta, key, value);
    },
    setStudyMeta(state, { i, key, value }) {
      Vue.set(state.studyRequest.items[i].meta, key, value);
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
