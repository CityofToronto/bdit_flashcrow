import Vue from 'vue';
import Vuex from 'vuex';

import {
  CentrelineType,
  COUNT_TYPES,
  FeatureCode,
  RoadIntersectionType,
  RoadSegmentType,
} from '@/lib/Constants';
import { apiFetch } from '@/lib/api/BackendClient';
import { InvalidCentrelineTypeError } from '@/lib/error/MoveErrors';
import DateTime from '@/lib/time/DateTime';
import requestStudy from '@/web/store/modules/requestStudy';
import viewData from '@/web/store/modules/viewData';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    requestStudy,
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
    requestReasons: [],
    // TOP-LEVEL UI
    dialog: null,
    drawerOpen: false,
    toast: null,
    // LOCATION
    location: null,
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
      if (location === null) {
        return null;
      }
      const { centrelineType, featureCode = null } = location;
      if (featureCode === null) {
        return null;
      }
      if (centrelineType === CentrelineType.SEGMENT) {
        return RoadSegmentType.enumValueOf(featureCode, 'featureCode');
      }
      if (centrelineType === CentrelineType.INTERSECTION) {
        return RoadIntersectionType.enumValueOf(featureCode, 'featureCode');
      }
      throw new InvalidCentrelineTypeError(centrelineType);
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
    clearDialog(state) {
      Vue.set(state, 'dialog', null);
    },
    setDialog(state, dialog) {
      Vue.set(state, 'dialog', dialog);
    },
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
    async saveStudyRequest({ commit, state }, { isSupervisor, studyRequest }) {
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
      const studyRequestNew = await apiFetch(url, options);
      commit('setDialog', {
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
