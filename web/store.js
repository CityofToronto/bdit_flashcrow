import Vue from 'vue';
import Vuex from 'vuex';

import { apiFetch } from '@/lib/BackendClient';
import ArrayUtils from '@/lib/ArrayUtils';
import {
  centrelineKey,
  CentrelineType,
  COUNT_TYPES,
  FeatureCode,
  SortKeys,
  SortDirection,
  Status,
} from '@/lib/Constants';
import { debounce } from '@/lib/FunctionUtils';
import { STUDY_DUPLICATE, STUDY_IRRELEVANT_TYPE } from '@/lib/i18n/ConfirmDialog';
import DateTime from '@/lib/time/DateTime';

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

const clearToastDebounced = debounce((commit) => {
  commit('clearToast');
}, TIMEOUT_TOAST);

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
    studyRequests: [],
    studyRequestLocations: new Map(),
    studyRequestUsers: new Map(),
    requestReasons: [],
    // map mode
    showMap: true,
    // ACTIVE STUDY REQUEST
    studyRequest: null,
    studyRequestLocation: null,
    studyRequestUser: null,
    // query that will appear in the search bar
    locationQuery: '',
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
    // TABLE ITEMS: STUDY REQUESTS
    itemsStudyRequests(state) {
      return state.studyRequests.map((studyRequest) => {
        const {
          centrelineId,
          centrelineType,
          userSubject,
        } = studyRequest;

        const key = centrelineKey(centrelineType, centrelineId);
        let location = null;
        if (state.studyRequestLocations.has(key)) {
          location = state.studyRequestLocations.get(key);
        }

        let requestedBy = null;
        if (state.studyRequestUsers.has(userSubject)) {
          requestedBy = state.studyRequestUsers.get(userSubject);
        }

        return {
          ...studyRequest,
          expandable: true,
          location,
          requestedBy,
        };
      });
    },
    // ACTIVE STUDY REQUEST
    studyRequestMinDueDate(state) {
      const { now, studyRequest } = state;
      if (studyRequest === null) {
        return null;
      }
      if (studyRequest.priority === 'URGENT') {
        return now;
      }
      return now.plus({ months: 2 });
    },
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
    studyTypesWithWarnings(state, getters) {
      const studyTypesSelected = new Set();
      if (state.studyRequest !== null) {
        state.studyRequest.studies.forEach(({ studyType: value }) => {
          studyTypesSelected.add(value);
        });
      }
      return COUNT_TYPES.map(({ label, value }) => {
        let warning = null;
        if (studyTypesSelected.has(value)) {
          warning = STUDY_DUPLICATE.getModalOptions({ label });
        } else if (!getters.studyTypesRelevantToLocation.includes(value)) {
          warning = STUDY_IRRELEVANT_TYPE.getModalOptions({ label });
        }
        return { label, value, warning };
      });
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
    // MAP MODE
    setShowMap(state, showMap) {
      Vue.set(state, 'showMap', showMap);
    },
    // STUDY REQUESTS
    clearStudyRequests(state) {
      Vue.set(state, 'studyRequests', []);
      Vue.set(state, 'studyRequestLocations', new Map());
      Vue.set(state, 'studyRequestUsers', new Map());
    },
    setStudyRequests(state, studyRequests) {
      Vue.set(state, 'studyRequests', studyRequests);
    },
    setStudyRequestLocations(state, studyRequestLocations) {
      Vue.set(state, 'studyRequestLocations', studyRequestLocations);
    },
    setStudyRequestUsers(state, studyRequestUsers) {
      Vue.set(state, 'studyRequestUsers', studyRequestUsers);
    },
    // ACTIVE STUDY REQUEST
    clearStudyRequest(state) {
      Vue.set(state, 'studyRequest', null);
    },
    setStudyRequest(state, studyRequest) {
      Vue.set(state, 'studyRequest', studyRequest);
    },
    setStudyRequestLocation(state, studyRequestLocation) {
      Vue.set(state, 'studyRequestLocation', studyRequestLocation);
    },
    setStudyRequestUser(state, studyRequestUser) {
      Vue.set(state, 'studyRequestUser', studyRequestUser);
    },
    setNewStudyRequest(state, studyTypes) {
      const { location, now } = state;
      const dueDate = now.plus({ months: 3 });
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
        serviceRequestId: null,
        priority: 'STANDARD',
        dueDate,
        reasons: [],
        ccEmails: [],
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
    async fetchLocationFromCentreline(_, { centrelineId, centrelineType }) {
      const options = {
        data: { centrelineId, centrelineType },
      };
      const locations = await apiFetch('/location/centreline', options);
      const locationsMap = new Map(locations);
      const key = centrelineKey(centrelineType, centrelineId);
      if (!locationsMap.has(key)) {
        // TODO: better error handling here
        throw new Error('not found!');
      }
      return locationsMap.get(key);
    },
    async fetchLocationsFromCentreline(_, centrelineTypesAndIds) {
      const centrelineIds = centrelineTypesAndIds.map(({ centrelineId: id }) => id);
      const centrelineTypes = centrelineTypesAndIds.map(({ centrelineType: type }) => type);
      const options = {
        data: {
          centrelineId: centrelineIds,
          centrelineType: centrelineTypes,
        },
      };
      const locations = await apiFetch('/location/centreline', options);
      return new Map(locations);
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
    async fetchStudyRequest({ commit, dispatch }, { id, isSupervisor }) {
      const url = `/requests/study/${id}`;
      const options = {};
      if (isSupervisor) {
        options.data = { isSupervisor };
      }
      const studyRequest = await apiFetch(url, options);
      commit('setStudyRequest', studyRequest);

      const {
        centrelineId,
        centrelineType,
        userSubject,
      } = studyRequest;

      const centrelineIdsAndTypes = [{ centrelineId, centrelineType }];
      const promiseLocations = dispatch('fetchLocationsFromCentreline', centrelineIdsAndTypes);

      const subjects = [userSubject];
      const promiseUsers = dispatch('fetchUsersBySubjects', subjects);

      const [
        studyRequestLocations,
        studyRequestUsers,
      ] = await Promise.all([promiseLocations, promiseUsers]);

      const key = centrelineKey(centrelineType, centrelineId);
      const studyRequestLocation = studyRequestLocations.get(key);
      commit('setStudyRequestLocation', studyRequestLocation);

      const studyRequestUser = studyRequestUsers.get(userSubject);
      commit('setStudyRequestUser', studyRequestUser);

      return {
        studyRequest,
        studyRequestLocation,
        studyRequestUser,
      };
    },
    async fetchAllStudyRequests({ commit, dispatch }, isSupervisor) {
      const options = {};
      if (isSupervisor) {
        options.data = { isSupervisor };
      }
      const studyRequests = await apiFetch('/requests/study', options);
      commit('setStudyRequests', studyRequests);

      const centrelineKeys = new Set();
      const centrelineIdsAndTypes = [];
      let subjects = new Set();
      studyRequests.forEach(({ centrelineId, centrelineType, userSubject }) => {
        const key = centrelineKey(centrelineId, centrelineType);
        if (!centrelineKeys.has(key)) {
          centrelineKeys.add(key);
          centrelineIdsAndTypes.push({ centrelineId, centrelineType });
        }
        subjects.add(userSubject);
      });
      subjects = Array.from(subjects);

      const promiseLocations = dispatch('fetchLocationsFromCentreline', centrelineIdsAndTypes);
      const promiseUsers = dispatch('fetchUsersBySubjects', subjects);
      const [
        studyRequestLocations,
        studyRequestUsers,
      ] = await Promise.all([promiseLocations, promiseUsers]);
      commit('setStudyRequestLocations', studyRequestLocations);
      commit('setStudyRequestUsers', studyRequestUsers);

      return {
        studyRequests,
        studyRequestLocations,
      };
    },
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
        data: { studyRequest: studyRequestNew, update },
      });
      return studyRequestNew;
    },
    async deleteStudyRequests({ dispatch, state }, { isSupervisor, studyRequests }) {
      const options = {
        method: 'DELETE',
        csrf: state.auth.csrf,
      };
      if (isSupervisor) {
        options.data = { isSupervisor };
      }
      const promisesStudyRequests = studyRequests.map(
        ({ id }) => apiFetch(`/requests/study/${id}`, options),
      );
      await Promise.all(promisesStudyRequests);
      // TODO: during supervisor view work, just delete locally
      // from `studyRequests`, `studyRequestLocations`
      await dispatch('fetchAllStudyRequests');
    },
    // USERS
    async fetchUsersBySubjects(_, subjects) {
      const options = {
        data: {
          subject: subjects,
        },
      };
      const users = await apiFetch('/users/bySubject', options);
      return new Map(users);
    },
  },
});
