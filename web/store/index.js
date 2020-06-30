import Vue from 'vue';
import Vuex from 'vuex';

import {
  getAuth,
  postStudyRequest,
  putStudyRequest,
} from '@/lib/api/WebApi';
import {
  getLocationFeatureType,
  getLocationsDescription,
} from '@/lib/geo/CentrelineUtils';
import {
  REQUEST_STUDY_SUBMITTED,
  REQUEST_STUDY_UPDATED,
} from '@/lib/i18n/Strings';
import CompositeId from '@/lib/io/CompositeId';
import DateTime from '@/lib/time/DateTime';
import viewData from '@/web/store/modules/viewData';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    viewData,
  },
  // TODO: organize state below
  state: {
    // AUTH / HELPERS STATE
    auth: {
      csrf: '',
      loggedIn: false,
      user: null,
    },
    now: DateTime.local(),
    // TOP-LEVEL UI
    dialog: null,
    dialogData: {},
    drawerOpen: false,
    toast: null,
    // NAVIGATION
    backViewRequest: { name: 'requestsTrack' },
    // LOCATION
    locations: [],
    locationMulti: false,
    legendOptions: {
      datesFrom: 3,
      layers: {
        collisions: true,
        studies: true,
        volume: true,
      },
    },
  },
  getters: {
    // AUTH / HELPERS STATE
    username(state) {
      if (!state.auth.loggedIn) {
        return null;
      }
      const { uniqueName } = state.auth.user;
      const i = uniqueName.indexOf('\\');
      if (i === -1) {
        return uniqueName;
      }
      return uniqueName.slice(i + 1);
    },
    userScope(state) {
      if (!state.auth.loggedIn) {
        return [];
      }
      const { scope } = state.auth.user;
      return scope;
    },
    // LOCATION
    locationFeatureType(state) {
      const { locations } = state;
      if (locations.length === 0) {
        return null;
      }
      return getLocationFeatureType(locations[0]);
    },
    locationsDescription(state) {
      return getLocationsDescription(state.locations);
    },
    s1(state) {
      return CompositeId.encode(state.locations);
    },
  },
  mutations: {
    // AUTH / HELPERS STATE
    setAuth(state, auth) {
      Vue.set(state, 'auth', auth);
    },
    // TOP-LEVEL UI
    clearDialog(state) {
      Vue.set(state, 'dialog', null);
      Vue.set(state, 'dialogData', {});
    },
    clearToast(state) {
      Vue.set(state, 'toast', null);
    },
    setDialog(state, { dialog, dialogData = {} }) {
      Vue.set(state, 'dialog', dialog);
      Vue.set(state, 'dialogData', dialogData);
    },
    setDrawerOpen(state, drawerOpen) {
      Vue.set(state, 'drawerOpen', drawerOpen);
    },
    setToast(state, toast) {
      Vue.set(state, 'toast', toast);
    },
    // NAVIGATION
    setBackViewRequest(state, backViewRequest) {
      Vue.set(state, 'backViewRequest', backViewRequest);
    },
    // LOCATION
    setLocations(state, locations) {
      Vue.set(state, 'locations', locations);
    },
    setLocationMulti(state, locationMulti) {
      Vue.set(state, 'locationMulti', locationMulti);
    },
    setLegendOptions(state, legendOptions) {
      Vue.set(state, 'legendOptions', legendOptions);
    },
  },
  actions: {
    // AUTH / HELPERS STATE
    async checkAuth({ commit }) {
      const auth = await getAuth('/auth');
      commit('setAuth', auth);
      return auth;
    },
    // STUDY REQUESTS
    async saveStudyRequest({ state, commit }, studyRequest) {
      const { id, urgent } = studyRequest;
      const update = id !== undefined;
      if (urgent && !update) {
        commit('setDialog', {
          dialog: 'AlertStudyRequestUrgent',
          dialogData: { update },
        });
      } else {
        const toast = update ? REQUEST_STUDY_UPDATED : REQUEST_STUDY_SUBMITTED;
        commit('setToast', toast);
      }

      const { csrf } = state.auth;
      if (update) {
        return putStudyRequest(csrf, studyRequest);
      }
      return postStudyRequest(csrf, studyRequest);
    },
  },
});
