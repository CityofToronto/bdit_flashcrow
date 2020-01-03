import Vue from 'vue';
import Vuex from 'vuex';

import ArrayUtils from '@/lib/ArrayUtils';
import {
  CentrelineType,
  COUNT_TYPES,
  FeatureCode,
  SortKeys,
  SortDirection,
  Status,
} from '@/lib/Constants';
import { debounce } from '@/lib/FunctionUtils';
import { apiFetch } from '@/lib/api/BackendClient';
import DateTime from '@/lib/time/DateTime';
import requestStudy from '@/web/store/modules/requestStudy';

Vue.use(Vuex);

const MAX_PER_CATEGORY = 10;
const TIMEOUT_TOAST = 10000;

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

const clearToastDebounced = debounce((commit) => {
  commit('clearToast');
}, TIMEOUT_TOAST);

// TODO: DRY with requestStudy module
function studyRequestEstimatedDeliveryDate(now, studyRequest) {
  if (studyRequest === null) {
    return null;
  }
  const { dueDate, priority } = studyRequest;
  if (priority === 'URGENT') {
    return dueDate;
  }
  const oneWeekBeforeDueDate = dueDate.minus({ weeks: 1 });
  const twoMonthsOut = now.plus({ months: 2 });
  if (oneWeekBeforeDueDate.valueOf() < twoMonthsOut.valueOf()) {
    return twoMonthsOut;
  }
  return oneWeekBeforeDueDate;
}

export default new Vuex.Store({
  modules: {
    requestStudy,
  },
  // TODO: organize state below
  state: {
    // modal
    modal: null,
    toast: null,
    // time
    now: DateTime.local(),
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
    studies: [],
    // FILTERING DATA
    // TODO: in searching / selecting phase, bring this under one "filter" key
    filterCountTypes: [...COUNT_TYPES.keys()],
    filterDate: null,
    filterDayOfWeek: [...Array(7).keys()],
    // REQUESTS
    requestReasons: [],
    // query that will appear in the search bar
    locationQuery: '',
    // DRAWER
    drawerOpen: true,
  },
  getters: {
    // AUTHENTICATION
    username(state) {
      if (state.auth.loggedIn) {
        const { email, name } = state.auth.user;
        return name || email;
      }
      return 'Guest';
    },
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
    // TABLE ITEMS: COUNTS
    itemsCounts(state) {
      return state.filterCountTypes.map((i) => {
        const type = COUNT_TYPES[i];
        const activeIndex = state.itemsCountsActive[type.value];
        let countsOfType = state.counts
          .filter(c => c.type.value === type.value);
        let studiesOfType = state.studies
          .filter(s => s.studyType === type.value);
        if (state.filterDate !== null) {
          const { start, end } = state.filterDate;
          countsOfType = countsOfType
            .filter(c => start <= c.date && c.date <= end);
          /*
           * TODO: determine if we should instead filter by estimated date here (e.g. from
           * the study request).
           */
          studiesOfType = studiesOfType
            .filter(c => start <= c.createdAt && c.createdAt <= end);
        }
        countsOfType = countsOfType
          .filter(c => state.filterDayOfWeek.includes(c.date.weekday));
        studiesOfType = studiesOfType
          .filter(({ daysOfWeek }) => daysOfWeek.some(d => state.filterDayOfWeek.includes(d)));

        const expandable = countsOfType.length > 0;

        if (countsOfType.length === 0 && studiesOfType.length === 0) {
          const noExistingCount = {
            id: type.value,
            type,
            date: null,
            status: Status.NO_EXISTING_COUNT,
          };
          return {
            activeIndex,
            counts: [noExistingCount],
            expandable,
            id: type.value,
          };
        }
        studiesOfType = studiesOfType.map((study) => {
          const {
            id,
            createdAt,
            studyRequestId,
          } = study;
          return {
            id: `STUDY:${id}`,
            type,
            date: createdAt,
            status: Status.REQUEST_IN_PROGRESS,
            studyRequestId,
          };
        });
        countsOfType = studiesOfType.concat(countsOfType);
        const countsOfTypeSorted = ArrayUtils.sortBy(
          countsOfType,
          SortKeys.Counts.DATE,
          SortDirection.DESC,
        );
        return {
          activeIndex,
          counts: countsOfTypeSorted,
          expandable,
          id: type.value,
        };
      });
    },
    // ACTIVE STUDY REQUEST
    studyTypesRelevantToLocation(state) {
      const countTypesAll = COUNT_TYPES.map(({ value }) => value);
      if (state.location === null) {
        return countTypesAll;
      }
      const { centrelineType, featureCode = null } = state.location;
      if (centrelineType === CentrelineType.INTERSECTION) {
        return ['TMC'];
      }
      if (featureCode === null) {
        return countTypesAll;
      }
      if (featureCode === FeatureCode.EXPRESSWAY || featureCode === FeatureCode.EXPRESSWAY_RAMP) {
        return ['RESCU'];
      }
      if (featureCode === FeatureCode.MAJOR_ARTERIAL) {
        return countTypesAll
          .filter(value => value !== 'TMC');
      }
      return countTypesAll
        .filter(value => value !== 'TMC' && value !== 'RESCU');
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
    setCountsResult(state, { counts, numPerCategory, studies }) {
      Vue.set(state, 'counts', counts);
      Vue.set(state, 'itemsCountsActive', makeItemsCountsActive());
      Vue.set(state, 'numPerCategory', numPerCategory);
      Vue.set(state, 'studies', studies);
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
    // DRAWER
    setDrawerOpen(state, drawerOpen) {
      Vue.set(state, 'drawerOpen', drawerOpen);
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
    async fetchLocationSuggestions({ commit }, query) {
      let locationSuggestions = null;
      if (query.startsWith('pxo:') || query.startsWith('px:')) {
        let pxStr = null;
        let signalType = null;
        if (query.startsWith('px:')) {
          pxStr = query.split('px:')[1].trim();
          signalType = 1;
        } else {
          pxStr = query.split('pxo:')[1].trim();
          signalType = 2;
        }
        const px = parseInt(pxStr, 10);
        if (Number.isNaN(px)) {
          commit('clearLocationSuggestions');
          return null;
        }
        const pxOptions = {
          data: { px, signalType },
        };
        locationSuggestions = await apiFetch('/px/suggest', pxOptions);
      } else {
        if (query.length < 3) {
          commit('clearLocationSuggestions');
          return null;
        }
        const options = {
          data: { q: query },
        };
        locationSuggestions = await apiFetch('/cotgeocoder/suggest', options);
      }
      commit('setLocationSuggestions', locationSuggestions);
      return locationSuggestions;
    },
    async fetchCountsByCentreline({ commit, state }, { centrelineId, centrelineType }) {
      const dataStudies = {
        centrelineId,
        centrelineType,
      };
      const optionsStudies = { data: dataStudies };

      const dataCounts = {
        centrelineId,
        centrelineType,
        maxPerCategory: MAX_PER_CATEGORY,
      };
      if (state.dateRange !== null) {
        Object.assign(dataCounts, state.dateRange);
      }
      const optionsCounts = { data: dataCounts };

      const [
        studies,
        { counts, numPerCategory },
      ] = await Promise.all([
        apiFetch('/studies/byCentreline', optionsStudies),
        apiFetch('/counts/byCentreline', optionsCounts),
      ]);

      const numPerCategoryNormalized = makeNumPerCategory();
      numPerCategory.forEach(({ n, category: { value } }) => {
        numPerCategoryNormalized[value] += n;
      });
      studies.forEach(({ studyType: value }) => {
        numPerCategoryNormalized[value] += 1;
      });

      const result = {
        counts,
        numPerCategory: numPerCategoryNormalized,
        studies,
      };
      commit('setCountsResult', result);
      return result;
    },
    // STUDY REQUESTS
    async saveStudyRequest({ commit, state }, { isSupervisor, studyRequest }) {
      const { now } = state;
      const estimatedDeliveryDate = studyRequestEstimatedDeliveryDate(now, studyRequest);
      const data = {
        ...studyRequest,
        estimatedDeliveryDate,
      };
      const update = data.id !== undefined;
      if (update && isSupervisor) {
        data.isSupervisor = true;
      }
      const method = update ? 'PUT' : 'POST';
      const url = update ? `/requests/study/${data.id}` : '/requests/study';
      const options = {
        method,
        csrf: state.auth.csrf,
        data,
      };
      const studyRequestNew = await apiFetch(url, options);
      commit('setModal', {
        component: 'FcModalRequestStudyConfirmation',
        data: {
          isSupervisor,
          studyRequest: studyRequestNew,
          update,
        },
      });
      return studyRequestNew;
    },
  },
});
