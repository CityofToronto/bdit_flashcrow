import Vue from 'vue';
import Vuex from 'vuex';

import { apiFetch } from '@/lib/api/BackendClient';
import { getLocationFeatureType } from '@/lib/geo/CentrelineUtils';
import {
  REQUEST_STUDY_SUBMITTED,
  REQUEST_STUDY_UPDATED,
} from '@/lib/i18n/Strings';
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
    },
    now: DateTime.local(),
    // TOP-LEVEL UI
    drawerOpen: false,
    toast: null,
    // LOCATION
    location: null,
    legendOptions: {
      datesFrom: 3,
      layers: {
        counts: true,
        collisions: true,
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
    // LOCATION
    locationFeatureType(state) {
      const { location } = state;
      return getLocationFeatureType(location);
    },
  },
  mutations: {
    // AUTH / HELPERS STATE
    setAuth(state, auth) {
      Vue.set(state, 'auth', auth);
    },
    // TOP-LEVEL UI
    setDrawerOpen(state, drawerOpen) {
      Vue.set(state, 'drawerOpen', drawerOpen);
    },
    clearToast(state) {
      Vue.set(state, 'toast', null);
    },
    setToast(state, toast) {
      Vue.set(state, 'toast', toast);
    },
    // LOCATION
    setLocation(state, location) {
      Vue.set(state, 'location', location);
    },
    setLegendOptions(state, legendOptions) {
      Vue.set(state, 'legendOptions', legendOptions);
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
      return toast;
    },
    // STUDY REQUESTS
    async saveStudyRequest({ state, commit }, { isSupervisor, studyRequest }) {
      const data = studyRequest;
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
      const toast = update ? REQUEST_STUDY_UPDATED : REQUEST_STUDY_SUBMITTED;
      commit('setToast', toast);
      return apiFetch(url, options);
    },
  },
});
