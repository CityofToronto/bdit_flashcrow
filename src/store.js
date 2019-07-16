import Vue from 'vue';
import Vuex from 'vuex';

import apiFetch from '@/lib/ApiFetch';
import ArrayUtils from '@/lib/ArrayUtils';
import {
  COUNT_TYPES,
  RequestStatus,
  SortKeys,
  SortDirection,
  Status,
} from '@/lib/Constants';
import FunctionUtils from '@/lib/FunctionUtils';

Vue.use(Vuex);

const MAX_PER_CATEGORY = 10;
const TIMEOUT_TOAST = 10000;

function makeStudy(studyType) {
  return {
    studyType,
    daysOfWeek: [2, 3, 4],
    duration: 24,
    hours: 'ROUTINE',
    notes: '',
  };
}

function makeItemsCountsActive() {
  const itemsCountsActive = {};
  COUNT_TYPES.forEach(({ value }) => {
    itemsCountsActive[value] = 0;
  });
  return itemsCountsActive;
}

function makeNumPerCategory() {
  const numPerCategory = {};
  COUNT_TYPES.forEach(({ value }) => {
    numPerCategory[value] = 0;
  });
  return numPerCategory;
}

const clearToastDebounced = FunctionUtils.debounce((commit) => {
  commit('clearToast');
}, TIMEOUT_TOAST);

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
      csrf: '',
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
    itemsCountsActive: makeItemsCountsActive(),
    numPerCategory: makeNumPerCategory(),
    // FILTERING DATA
    // TODO: in searching / selecting phase, bring this under one "filter" key
    filterCountTypes: [...COUNT_TYPES.keys()],
    filterDate: null,
    filterDayOfWeek: [...Array(7).keys()],
    // FILTERING REQUESTS
    filterRequestStatus: Object.keys(RequestStatus),
    // REQUESTS
    studyRequests: [],
    requestReasons: [],
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
      return state.filterCountTypes.length !== COUNT_TYPES.length;
    },
    hasFilterDayOfWeek(state) {
      return state.filterDayOfWeek.length !== 7;
    },
    hasFilterRequestStatus(state) {
      return state.filterRequestStatus.length !== Object.keys(RequestStatus).length;
    },
    // TABLE ITEMS: COUNTS
    itemsCounts(state) {
      return state.filterCountTypes.map((i) => {
        const type = COUNT_TYPES[i];
        const activeIndex = state.itemsCountsActive[type.value];
        let countsOfType = state.counts
          .filter(c => c.type.value === type.value);
        if (state.filterDate !== null) {
          const { start, end } = state.filterDate;
          countsOfType = countsOfType
            .filter(c => start <= c.date && c.date <= end);
        }
        countsOfType = countsOfType
          .filter(c => state.filterDayOfWeek.includes(c.date.getDay()));
        if (countsOfType.length === 0) {
          const noExistingCount = {
            id: type.value,
            type,
            date: null,
            status: Status.NO_EXISTING_COUNT,
          };
          return {
            activeIndex,
            counts: [noExistingCount],
            expandable: false,
            id: type.value,
          };
        }
        const countsOfTypeSorted = ArrayUtils.sortBy(
          countsOfType,
          SortKeys.Counts.DATE,
          SortDirection.DESC,
        );
        return {
          activeIndex,
          counts: countsOfTypeSorted,
          expandable: true,
          id: type.value,
        };
      });
    },
    // TABLE ITEMS: STUDY REQUESTS
    itemsStudyRequests(state) {
      return state.studyRequests
        .filter(({ status }) => state.filterRequestStatus.includes(status));
    },
    // ACTIVE STUDY REQUEST
    studyRequestModel(state, getters) {
      const { studyRequest } = state;
      if (studyRequest === null) {
        return null;
      }
      if (studyRequest.id !== undefined) {
        /*
         * This study request instance has already been persisted to database, so we
         * don't need to normalize it in the same way.
         */
        return studyRequest;
      }
      const {
        hasServiceRequestId,
        serviceRequestId,
        priority,
        dueDate,
        reasons,
        ccEmails: ccEmailsStr,
        centrelineId,
        centrelineType,
        geom,
        studies,
      } = studyRequest;
      const ccEmails = ccEmailsStr
        .trim()
        .split(',')
        .map(ccEmail => ccEmail.trim())
        .filter(ccEmail => ccEmail !== '');
      const estimatedDeliveryDate = getters.studyRequestEstimatedDeliveryDate;
      return {
        serviceRequestId: hasServiceRequestId ? serviceRequestId : null,
        priority,
        dueDate,
        estimatedDeliveryDate,
        reasons,
        ccEmails,
        centrelineId,
        centrelineType,
        geom,
        studies,
      };
    },
    studyTypesWarnDuplicates(state) {
      if (state.studyRequest === null) {
        return COUNT_TYPES;
      }
      const studyTypesSelected = new Set(
        state.studyRequest.studies.map(({ studyType }) => studyType),
      );
      return COUNT_TYPES.map(({ label, value }) => {
        const studyType = { label, value };
        if (studyTypesSelected.has(studyType)) {
          studyType.icon = 'exclamation-triangle';
        }
        return studyType;
      });
    },
    studyRequestEstimatedDeliveryDate(state) {
      const { now, studyRequest } = state;
      if (studyRequest === null) {
        return null;
      }
      const { dueDate, priority } = state.studyRequest;
      if (dueDate === null || priority === null) {
        return null;
      }
      if (priority === 'URGENT') {
        return dueDate;
      }
      const oneWeekBeforeDueDate = new Date(
        dueDate.getFullYear(),
        dueDate.getMonth(),
        dueDate.getDate() - 7,
      );
      const twoMonthsOut = new Date(
        now.getFullYear(),
        now.getMonth() + 2,
        now.getDate(),
      );
      if (oneWeekBeforeDueDate.valueOf() < twoMonthsOut.valueOf()) {
        return twoMonthsOut;
      }
      return oneWeekBeforeDueDate;
    },
  },
  mutations: {
    webInit(state, { reasons }) {
      Vue.set(state, 'requestReasons', reasons);
    },
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
      Vue.set(state, 'itemsCountsActive', makeItemsCountsActive());
      Vue.set(state, 'numPerCategory', numPerCategory);
    },
    setItemsCountsActive(state, { value, activeIndex }) {
      Vue.set(state.itemsCountsActive, value, activeIndex);
    },
    // FILTERING DATA
    clearFilters(state) {
      Vue.set(state, 'filterCountTypes', [...COUNT_TYPES.keys()]);
      Vue.set(state, 'filterDate', null);
      Vue.set(state, 'filterDayOfWeek', [...Array(7).keys()]);
    },
    setFilterCountTypes(state, filterCountTypes) {
      Vue.set(state, 'filterCountTypes', filterCountTypes);
      Vue.set(state, 'itemsCountsActive', makeItemsCountsActive());
    },
    setFilterDate(state, filterDate) {
      Vue.set(state, 'filterDate', filterDate);
      Vue.set(state, 'itemsCountsActive', makeItemsCountsActive());
    },
    setFilterDayOfWeek(state, filterDayOfWeek) {
      Vue.set(state, 'filterDayOfWeek', filterDayOfWeek);
      Vue.set(state, 'itemsCountsActive', makeItemsCountsActive());
    },
    // FILTERING REQUESTS
    setFilterRequestStatus(state, filterRequestStatus) {
      Vue.set(state, 'filterRequestStatus', filterRequestStatus);
    },
    // MAP MODE
    setShowMap(state, showMap) {
      Vue.set(state, 'showMap', showMap);
    },
    // STUDY REQUESTS
    clearStudyRequests(state) {
      Vue.set(state, 'studyRequests', []);
    },
    setStudyRequests(state, studyRequests) {
      Vue.set(state, 'studyRequests', studyRequests);
    },
    // ACTIVE STUDY REQUEST
    clearStudyRequest(state) {
      Vue.set(state, 'studyRequest', null);
    },
    setStudyRequest(state, studyRequest) {
      Vue.set(state, 'studyRequest', studyRequest);
    },
    setNewStudyRequest(state, studyTypes) {
      const { location } = state;
      const {
        centrelineId,
        centrelineType,
        lng,
        lat,
      } = location;
      const geom = {
        type: 'Point',
        coordinates: [lng, lat],
      };
      const studies = studyTypes.map(makeStudy);
      const studyRequest = {
        hasServiceRequestId: null,
        serviceRequestId: null,
        priority: 'STANDARD',
        dueDate: null,
        reasons: [],
        ccEmails: '',
        centrelineId,
        centrelineType,
        geom,
        studies,
      };
      Vue.set(state, 'studyRequest', studyRequest);
    },
    addStudyToStudyRequest(state, studyType) {
      const item = makeStudy(studyType);
      state.studyRequest.studies.push(item);
    },
    removeStudyFromStudyRequest(state, i) {
      state.studyRequest.studies.splice(i, 1);
    },
    setStudyRequestMeta(state, { key, value }) {
      Vue.set(state.studyRequest, key, value);
    },
    setStudyMeta(state, { i, key, value }) {
      Vue.set(state.studyRequest.studies[i], key, value);
    },
  },
  actions: {
    async webInit({ commit }) {
      const response = await apiFetch('/web/init');
      commit('webInit', response);
      return response;
    },
    async setToast({ commit }, toast) {
      commit('setToast', toast);
      clearToastDebounced(commit);
      return toast;
    },
    async checkAuth({ commit }) {
      const auth = await apiFetch('/auth');
      commit('setAuth', auth);
      return auth;
    },
    async fetchLocationByKeyString({ commit }, keyString) {
      const options = {
        data: { keyString },
      };
      const location = await apiFetch('/cotgeocoder/findAddressCandidates', options);
      commit('setLocation', location);
      return location;
    },
    async fetchLocationFromCentreline({ commit }, { centrelineId, centrelineType }) {
      const options = {
        data: { centrelineId, centrelineType },
      };
      const location = await apiFetch('/location/centreline', options);
      commit('setLocation', location);
      return location;
    },
    async fetchLocationSuggestions({ commit }, query) {
      if (query.length < 3) {
        commit('clearLocationSuggestions');
        return null;
      }
      const options = {
        data: { q: query },
      };
      const locationSuggestions = await apiFetch('/cotgeocoder/suggest', options);
      commit('setLocationSuggestions', locationSuggestions);
      return locationSuggestions;
    },
    async fetchCountsByCentreline({ commit, state }, { centrelineId, centrelineType }) {
      const data = {
        centrelineId,
        centrelineType,
        maxPerCategory: MAX_PER_CATEGORY,
      };
      if (state.dateRange !== null) {
        Object.assign(data, state.dateRange);
      }
      const options = { data };
      const { counts, numPerCategory } = await apiFetch('/counts/byCentreline', options);
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
    },
    // STUDY REQUESTS
    async fetchStudyRequest({ commit }, id) {
      const url = `/requests/study/${id}`;
      const studyRequest = await apiFetch(url);
      studyRequest.dueDate = new Date(
        studyRequest.dueDate.slice(0, -1),
      );
      studyRequest.estimatedDeliveryDate = new Date(
        studyRequest.estimatedDeliveryDate.slice(0, -1),
      );
      commit('setStudyRequest', studyRequest);
      return studyRequest;
    },
    async fetchAllStudyRequests({ commit }) {
      let studyRequests = await apiFetch('/requests/study');
      studyRequests = studyRequests.map((studyRequest) => {
        const dueDate = new Date(
          studyRequest.dueDate.slice(0, -1),
        );
        const estimatedDeliveryDate = new Date(
          studyRequest.estimatedDeliveryDate.slice(0, -1),
        );
        return {
          ...studyRequest,
          dueDate,
          estimatedDeliveryDate,
        };
      });
      commit('setStudyRequests', studyRequests);
      return studyRequests;
    },
    async saveActiveStudyRequest({ commit, getters, state }) {
      const data = getters.studyRequestModel;
      const options = {
        method: 'POST',
        csrf: state.auth.csrf,
        data,
      };
      const studyRequest = await apiFetch('/requests/study', options);
      studyRequest.dueDate = new Date(
        studyRequest.dueDate.slice(0, -1),
      );
      studyRequest.estimatedDeliveryDate = new Date(
        studyRequest.estimatedDeliveryDate.slice(0, -1),
      );
      commit('setModal', {
        component: 'FcModalRequestStudyConfirmation',
        data: { studyRequest },
      });
      return studyRequest;
    },
  },
});
