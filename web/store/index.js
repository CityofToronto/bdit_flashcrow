import Vue from 'vue';
import Vuex from 'vuex';

import {
  CentrelineType,
  COUNT_TYPES,
  FeatureCode,
} from '@/lib/Constants';
import { debounce } from '@/lib/FunctionUtils';
import { apiFetch } from '@/lib/api/BackendClient';
import DateTime from '@/lib/time/DateTime';
import requestStudy from '@/web/store/modules/requestStudy';

Vue.use(Vuex);

const TIMEOUT_TOAST = 10000;

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
    // AUTH / HELPERS STATE
    auth: {
      csrf: '',
      loggedIn: false,
    },
    now: DateTime.local(),
    requestReasons: [],
    // TOP-LEVEL UI
    drawerOpen: true,
    modal: null,
    toast: null,
    // LOCATION
    location: null,
    locationSuggestions: null,
    locationQuery: '',
  },
  getters: {
    // AUTH / HELPERS STATE
    username(state) {
      if (state.auth.loggedIn) {
        const { email, name } = state.auth.user;
        return name || email;
      }
      return 'Guest';
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
    // AUTH / HELPERS STATE
    webInit(state, { reasons }) {
      Vue.set(state, 'requestReasons', reasons);
    },
    setAuth(state, auth) {
      Vue.set(state, 'auth', auth);
    },
    // TOP-LEVEL UI
    setDrawerOpen(state, drawerOpen) {
      Vue.set(state, 'drawerOpen', drawerOpen);
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
    // LOCATION
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
  },
  actions: {
    // AUTH / HELPERS STATE
    async webInit({ commit }) {
      const response = await apiFetch('/web/init');
      commit('webInit', response);
      return response;
    },
    async checkAuth({ commit }) {
      const auth = await apiFetch('/auth');
      commit('setAuth', auth);
      return auth;
    },
    // TOP-LEVEL UI
    async setToast({ commit }, toast) {
      commit('setToast', toast);
      clearToastDebounced(commit);
      return toast;
    },
    // LOCATION
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
