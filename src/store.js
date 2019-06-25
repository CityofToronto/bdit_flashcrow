import Vue from 'vue';
import Vuex from 'vuex';

import apiFetch from '@/lib/ApiFetch';
import Constants from '@/lib/Constants';
import FunctionUtils from '@/lib/FunctionUtils';
import SampleData from '@/lib/SampleData';

Vue.use(Vuex);

const MAX_PER_CATEGORY = 10;
const REQUESTS = SampleData.randomRequests();

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

function makeNumPerCategory() {
  const numPerCategory = {};
  Constants.COUNT_TYPES.forEach(({ value }) => {
    numPerCategory[value] = 0;
  });
  return numPerCategory;
}

const clearToastDebounced = FunctionUtils.debounce((commit) => {
  commit('clearToast');
}, 5000);

export default new Vuex.Store({
  // TODO: organize state below
  state: {
    // modal
    modal: null,
    toast: null,
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
    counts: [],
    numPerCategory: makeNumPerCategory(),
    // FILTERING DATA
    // TODO: in searching / selecting phase, bring this under one "filter" key
    filterCountTypes: [...Constants.COUNT_TYPES.keys()],
    filterDate: null,
    filterDayOfWeek: [...Array(7).keys()],
    // FILTERING REQUESTS
    filterRequestStatus: [],
    // REQUESTS
    requests: REQUESTS,
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
      return getters.hasFilterCountTypes
        || state.filterDate !== null
        || getters.hasFilterDayOfWeek;
    },
    hasFilterCountTypes(state) {
      return state.filterCountTypes.length !== Constants.COUNT_TYPES.length;
    },
    hasFilterDayOfWeek(state) {
      return state.filterDayOfWeek.length !== 7;
    },
    // ACTIVE STUDY REQUEST
    studyTypesWarnDuplicates(state) {
      if (state.studyRequest === null) {
        return Constants.COUNT_TYPES;
      }
      const studyTypesSelected = new Set(
        state.studyRequest.items.map(({ item }) => item),
      );
      return Constants.COUNT_TYPES.map(({ label, value }) => {
        const studyType = { label, value };
        if (studyTypesSelected.has(studyType)) {
          studyType.icon = 'exclamation-triangle';
        }
        return studyType;
      });
    },
  },
  mutations: {
    clearModal(state) {
      Vue.set(state, 'modal', null);
    },
    setModal(state, modal) {
      Vue.set(state, 'modal', modal);
    },
    clearToast(state) {
      Vue.set(state, 'toast', null);
    },
    setToast(state, toast) {
      Vue.set(state, 'toast', toast);
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
      Vue.set(state, 'locationQuery', null);
    },
    setLocation(state, location) {
      Vue.set(state, 'location', location);
      Vue.set(state, 'locationQuery', location.description);
    },
    setLocationQuery(state, locationQuery) {
      Vue.set(state, 'locationQuery', locationQuery);
    },
    // COUNTS
    setCountsResult(state, { counts, numPerCategory }) {
      Vue.set(state, 'counts', counts);
      Vue.set(state, 'numPerCategory', numPerCategory);
    },
    // FILTERING DATA
    clearFilters(state) {
      Vue.set(state, 'filterCountTypes', [...Constants.COUNT_TYPES.keys()]);
      Vue.set(state, 'filterDate', null);
      Vue.set(state, 'filterDayOfWeek', [...Array(7).keys()]);
    },
    setFilterCountTypes(state, filterCountTypes) {
      Vue.set(state, 'filterCountTypes', filterCountTypes);
    },
    setFilterDate(state, filterDate) {
      Vue.set(state, 'filterDate', filterDate);
    },
    setFilterDayOfWeek(state, filterDayOfWeek) {
      Vue.set(state, 'filterDayOfWeek', filterDayOfWeek);
    },
    // FILTERING REQUESTS
    setFilterRequestStatus(state, filterRequestStatus) {
      Vue.set(state, 'filterRequestStatus', filterRequestStatus);
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
        priority: 'STANDARD',
        dueDate: null,
        reasons: [],
        ccEmails: '',
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
    setToast({ commit }, toast) {
      commit('setToast', toast);
      clearToastDebounced(commit);
    },
    checkAuth({ commit }) {
      return apiFetch('/auth')
        .then((auth) => {
          commit('setAuth', auth);
          return auth;
        });
    },
    fetchLocationByKeyString({ commit }, keyString) {
      const options = {
        data: { keyString },
      };
      return apiFetch('/cotgeocoder/findAddressCandidates', options)
        .then((location) => {
          commit('setLocation', location);
          return location;
        });
    },
    fetchLocationFromCentreline({ commit }, { centrelineId, centrelineType }) {
      const options = {
        data: { centrelineId, centrelineType },
      };
      return apiFetch('/location/centreline', options)
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
    fetchCountsByCentreline({ commit, state }, { centrelineId, centrelineType }) {
      const data = {
        centrelineId,
        centrelineType,
        maxPerCategory: MAX_PER_CATEGORY,
      };
      if (state.dateRange !== null) {
        Object.assign(data, state.dateRange);
      }
      const options = { data };
      return apiFetch('/counts/byCentreline', options)
        .then(({ counts, numPerCategory }) => {
          const countsNormalized = counts.map((count) => {
            const countNormalized = Object.assign({}, count);
            countNormalized.date = new Date(
              countNormalized.date.slice(0, -1),
            );
            return countNormalized;
          });
          // TODO: possibly move this normalization to the backend?
          const numPerCategoryNormalized = makeNumPerCategory();
          numPerCategory.forEach(({ n, category: { value } }) => {
            numPerCategoryNormalized[value] += n;
          });
          const result = {
            counts: countsNormalized,
            numPerCategory: numPerCategoryNormalized,
          };
          commit('setCountsResult', result);
          return result;
        });
    },
  },
});
