import Vue from 'vue';
import Vuex from 'vuex';

import { LocationMode, LocationSelectionType } from '@/lib/Constants';
import {
  getAuth,
  getLocationsByCentreline,
  getLocationsByCorridor,
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
    locationsSelection: {
      locations: [],
      selectionType: LocationSelectionType.POINTS,
    },
    locationsEdit: [],
    locationsEditIndex: -1,
    locationsEditSelection: {
      locations: [],
      selectionType: LocationSelectionType.POINTS,
    },
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
    location(state, getters) {
      if (getters.locationsEmpty) {
        return null;
      }
      const { locations } = state.locationsSelection;
      return locations[0];
    },
    locationFeatureType(state, getters) {
      if (getters.locationsEmpty) {
        return null;
      }
      const { locations } = state.locationsSelection;
      return getLocationFeatureType(locations[0]);
    },
    locationsDescription(state) {
      const { locations } = state.locationsSelection;
      return getLocationsDescription(locations);
    },
    locationsEditDescription(state) {
      const { locations } = state.locationsEditSelection;
      return getLocationsDescription(locations);
    },
    locationsEmpty(state) {
      return state.locationsSelection.locations.length === 0;
    },
    locationsRouteParams(state) {
      const { locations, selectionType } = state.locationsSelection;
      const s1 = CompositeId.encode(locations);
      return { s1, selectionTypeName: selectionType.name };
    },
    s1(state) {
      return CompositeId.encode(state.locationsSelection.locations);
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
      state.locationsEditSelection.locations.push(location);
    },
    cancelLocationsEdit(state) {
      if (state.locations.length > 1) {
        Vue.set(state, 'locationMode', LocationMode.MULTI);
      } else {
        Vue.set(state, 'locationMode', LocationMode.SINGLE);
      }
    },
    removeLocationEdit(state, i) {
      state.locationsEditSelection.locations.splice(i, 1);
    },
    saveLocationsEdit(state) {
      const { locations, selectionType } = state.locationsEditSelection;
      Vue.set(state, 'locations', [...state.locationsEdit]);
      Vue.set(state, 'locationsSelection', {
        locations: [...locations],
        selectionType,
      });
      Vue.set(state, 'locationsEdit', []);
      Vue.set(state, 'locationsEditIndex', -1);
      Vue.set(state, 'locationsEditSelection', {
        locations: [],
        selectionType: LocationSelectionType.POINTS,
      });
      if (state.locations.length > 1) {
        Vue.set(state, 'locationMode', LocationMode.MULTI);
      } else {
        Vue.set(state, 'locationMode', LocationMode.SINGLE);
      }
    },
    setLocationEdit(state, location) {
      if (state.locationsEditIndex === -1) {
        state.locationsEditSelection.locations.push(location);
      } else {
        Vue.set(state.locationsEditSelection.locations, state.locationsEditIndex, location);
        Vue.set(state, 'locationsEditIndex', -1);
      }
    },
    setLocationEditSelectionType(state, selectionType) {
      Vue.set(state.locationsEditSelection, 'selectionType', selectionType);
    },
    setLocationEditIndex(state, locationsEditIndex) {
      Vue.set(state, 'locationsEditIndex', locationsEditIndex);
    },
    setLocationMode(state, locationMode) {
      Vue.set(state, 'locationMode', locationMode);
      if (locationMode === LocationMode.SINGLE && state.locations.length > 1) {
        const [location] = state.locations;
        Vue.set(state, 'locations', [location]);
        Vue.set(state, 'locationsSelection', {
          locations: [location],
          selectionType: LocationSelectionType.POINTS,
        });
      } else if (locationMode === LocationMode.MULTI_EDIT) {
        const { locations, selectionType } = state.locationsSelection;
        Vue.set(state, 'locationsEdit', [...state.locations]);
        Vue.set(state, 'locationsEditIndex', -1);
        Vue.set(state, 'locationsEditSelection', {
          locations: [...locations],
          selectionType,
        });
      }
    },
    setLocations(state, locations) {
      Vue.set(state, 'locations', [...locations]);
      if (state.locations.length > 1) {
        Vue.set(state, 'locationMode', LocationMode.MULTI);
      } else {
        Vue.set(state, 'locationMode', LocationMode.SINGLE);
      }
    },
    setLocationsSelection(state, locationsSelection) {
      const { locations, selectionType } = locationsSelection;
      Vue.set(state, 'locationsSelection', {
        locations: [...locations],
        selectionType,
      });
    },
    setLocationsEdit(state, locationsEdit) {
      Vue.set(state, 'locationsEdit', [...locationsEdit]);
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
    // LOCATION
    async initLocations({ commit, state }, { features, selectionType: selectionTypeNext }) {
      const { locations, selectionType } = state.locationsSelection;
      const s1 = CompositeId.encode(locations);
      const s1Next = CompositeId.encode(features);
      if (s1 === s1Next && selectionType === selectionTypeNext) {
        return;
      }

      let locationsNext = await getLocationsByCentreline(features);
      const locationsSelection = {
        locations: locationsNext,
        selectionType: selectionTypeNext,
      };
      commit('setLocationsSelection', locationsSelection);
      if (selectionType === LocationSelectionType.CORRIDOR) {
        locationsNext = await getLocationsByCorridor(locationsNext);
      }
      commit('setLocations', locationsNext);
    },
    async syncLocationsEdit({ commit, state }) {
      const { locationsEditSelection: { locations, selectionType } } = state;
      let locationsEdit = locations;
      if (selectionType === LocationSelectionType.CORRIDOR) {
        locationsEdit = await getLocationsByCorridor(locations);
      }
      commit('setLocationsEdit', locationsEdit);
    },
  },
});
