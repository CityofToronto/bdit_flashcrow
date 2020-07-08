import Vue from 'vue';
import Vuex from 'vuex';

import { LocationMode } from '@/lib/Constants';
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
    locationsEdit: [],
    locationEditIndex: -1,
    locationMode: LocationMode.SINGLE,
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
    location(state) {
      const { locations } = state;
      if (locations.length === 0) {
        return null;
      }
      return locations[0];
    },
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
    addLocationEdit(state, location) {
      state.locationsEdit.push(location);
    },
    cancelLocationsEdit(state) {
      if (state.locations.length > 1) {
        Vue.set(state, 'locationMode', LocationMode.MULTI);
      } else {
        Vue.set(state, 'locationMode', LocationMode.SINGLE);
      }
    },
    removeLocationEdit(state, i) {
      state.locationsEdit.splice(i, 1);
    },
    saveLocationsEdit(state) {
      Vue.set(state, 'locations', state.locationsEdit);
      Vue.set(state, 'locationsEdit', []);
      if (state.locations.length > 1) {
        Vue.set(state, 'locationMode', LocationMode.MULTI);
      } else {
        Vue.set(state, 'locationMode', LocationMode.SINGLE);
      }
    },
    setLocationEdit(state, location) {
      if (state.locationEditIndex === -1) {
        state.locationsEdit.push(location);
      } else {
        Vue.set(state.locationsEdit, state.locationEditIndex, location);
      }
    },
    setLocationEditIndex(state, locationEditIndex) {
      Vue.set(state, 'locationEditIndex', locationEditIndex);
    },
    setLocationMode(state, locationMode) {
      Vue.set(state, 'locationMode', locationMode);
      if (locationMode === LocationMode.SINGLE && state.locations.length > 1) {
        Vue.set(state, 'locations', state.locations.slice(0, 1));
      } else if (locationMode === LocationMode.MULTI_EDIT) {
        Vue.set(state, 'locationsEdit', state.locations);
      }
    },
    setLocations(state, locations) {
      Vue.set(state, 'locations', locations);
      if (state.locations.length > 1) {
        Vue.set(state, 'locationMode', LocationMode.MULTI);
      } else {
        Vue.set(state, 'locationMode', LocationMode.SINGLE);
      }
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
