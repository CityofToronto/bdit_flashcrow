import Vue from 'vue';
import Vuex from 'vuex';

import {
  LocationMode,
  LocationSelectionType,
  MAX_LOCATIONS,
} from '@/lib/Constants';
import { formatUsername } from '@/lib/StringFormatters';
import {
  getAuth,
  getLocationsByCentreline,
  getLocationsByCorridor,
  postStudyRequest,
  postStudyRequestBulk,
  putStudyRequest,
  putStudyRequestBulk,
} from '@/lib/api/WebApi';
import { getLocationsSelectionDescription } from '@/lib/geo/CentrelineUtils';
import {
  REQUEST_STUDY_SUBMITTED,
  REQUEST_STUDY_UPDATED,
} from '@/lib/i18n/Strings';
import CompositeId from '@/lib/io/CompositeId';
import DateTime from '@/lib/time/DateTime';
import FrontendEnv from '@/web/config/FrontendEnv';
import editRequests from '@/web/store/modules/editRequests';
import mapLayers from '@/web/store/modules/mapLayers';
import trackRequests from '@/web/store/modules/trackRequests';
import viewData from '@/web/store/modules/viewData';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    editRequests,
    mapLayers,
    trackRequests,
    viewData,
  },
  state: {
    // AUTH / HELPERS STATE
    auth: {
      csrf: '',
      loggedIn: false,
      user: null,
    },
    frontendEnv: FrontendEnv.get(),
    now: DateTime.local(),
    title: '',
    // TOP-LEVEL UI
    ariaNotification: '',
    dialog: null,
    dialogData: {},
    filtersOpen: false,
    toast: null,
    toastData: {},
    toastKey: 0,
    // NAVIGATION
    backViewRequest: { name: 'requestsTrack' },
    // LOCATION
    locations: [],
    locationsIndex: -1,
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
  },
  getters: {
    // NAVIGATION
    labelBackViewRequest(state, getters) {
      const { name } = state.backViewRequest;
      if (name === 'requestsTrack') {
        return 'Track Requests';
      }
      if (getters.locationsEmpty) {
        return 'View Map';
      }
      return 'View Data';
    },
    routeBackViewRequest(state, getters) {
      const { name } = state.backViewRequest;
      if (name === 'requestsTrack') {
        return { name: 'requestsTrack' };
      }
      if (getters.locationsEmpty) {
        return { name: 'viewData' };
      }
      const params = getters.locationsRouteParams;
      return {
        name: 'viewDataAtLocation',
        params,
      };
    },
    // AUTH / HELPERS STATE
    pageTitle(state) {
      if (state.title === '') {
        return state.frontendEnv.appTitle;
      }
      return `${state.frontendEnv.appTitle} \u00b7 ${state.title}`;
    },
    username(state) {
      if (!state.auth.loggedIn) {
        return null;
      }
      return formatUsername(state.auth.user);
    },
    userScope(state) {
      if (!state.auth.loggedIn) {
        return [];
      }
      const { scope } = state.auth.user;
      return scope;
    },
    // LOCATION
    locationActive(state, getters) {
      if (state.locationMode === LocationMode.SINGLE) {
        if (getters.locationsEmpty) {
          return null;
        }
        const { locations } = state.locationsSelection;
        return locations[0];
      }
      const n = state.locations.length;
      if (state.locationsIndex < 0 || state.locationsIndex >= n) {
        return null;
      }
      return state.locations[state.locationsIndex];
    },
    locationsDescription(state) {
      return getLocationsSelectionDescription(state.locationsSelection);
    },
    locationsEditDescription(state) {
      return getLocationsSelectionDescription(state.locationsEditSelection);
    },
    locationsEditEmpty(state) {
      return state.locationsEditSelection.locations.length === 0;
    },
    locationsEditFull(state) {
      return state.locationsEditSelection.locations.length >= MAX_LOCATIONS;
    },
    locationsEmpty(state) {
      return state.locationsSelection.locations.length === 0;
    },
    locationsForMode(state) {
      if (state.locationMode === LocationMode.MULTI_EDIT) {
        return state.locationsEdit;
      }
      return state.locations;
    },
    locationsForModeEmpty(state, getters) {
      return getters.locationsForMode.length === 0;
    },
    locationsRouteParams(state) {
      const { locations, selectionType } = state.locationsSelection;
      const s1 = CompositeId.encode(locations);
      return { s1, selectionTypeName: selectionType.name };
    },
    locationsSelectionForMode(state) {
      if (state.locationMode === LocationMode.MULTI_EDIT) {
        return state.locationsEditSelection;
      }
      return state.locationsSelection;
    },
  },
  mutations: {
    // AUTH / HELPERS STATE
    setAuth(state, auth) {
      Vue.set(state, 'auth', auth);
    },
    setTitle(state, title) {
      Vue.set(state, 'title', title);
    },
    // TOP-LEVEL UI
    setAriaNotification(state, ariaNotification) {
      Vue.set(state, 'ariaNotification', ariaNotification);
    },
    clearDialog(state) {
      Vue.set(state, 'dialog', null);
      Vue.set(state, 'dialogData', {});
    },
    clearToast(state) {
      Vue.set(state, 'toast', null);
      Vue.set(state, 'toastData', {});
    },
    setDialog(state, { dialog, dialogData = {} }) {
      Vue.set(state, 'dialog', dialog);
      Vue.set(state, 'dialogData', dialogData);
    },
    setFiltersOpen(state, filtersOpen) {
      Vue.set(state, 'filtersOpen', filtersOpen);
    },
    setToast(state, { toast, toastData = {} }) {
      Vue.set(state, 'toast', toast);
      Vue.set(state, 'toastData', toastData);
      Vue.set(state, 'toastKey', state.toastKey + 1);
    },
    setToastBackendError(state, err) {
      Vue.set(state, 'toast', 'BackendError');
      Vue.set(state, 'toastData', { err });
      Vue.set(state, 'toastKey', state.toastKey + 1);
    },
    setToastError(state, text) {
      Vue.set(state, 'toast', 'Error');
      Vue.set(state, 'toastData', { text });
      Vue.set(state, 'toastKey', state.toastKey + 1);
    },
    setToastInfo(state, text) {
      Vue.set(state, 'toast', 'Info');
      Vue.set(state, 'toastData', { text });
      Vue.set(state, 'toastKey', state.toastKey + 1);
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
      Vue.set(state, 'locationsIndex', -1);
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
    setLocationsEditIndex(state, locationsEditIndex) {
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
    setLocationsIndex(state, locationsIndex) {
      Vue.set(state, 'locationsIndex', locationsIndex);
    },
    setLocationsSelection(state, locationsSelection) {
      const { locations, selectionType } = locationsSelection;
      Vue.set(state, 'locationsSelection', {
        locations: [...locations],
        selectionType,
      });
    },
    setLocationsSelectionForMode(state, locationsSelection) {
      const { locationMode } = state;
      const { locations, selectionType } = locationsSelection;
      const locationsSelectionCopy = {
        locations: [...locations],
        selectionType,
      };
      if (locationMode === LocationMode.MULTI_EDIT) {
        Vue.set(state, 'locationsEditSelection', locationsSelectionCopy);
      } else {
        Vue.set(state, 'locationsSelection', locationsSelectionCopy);
      }
    },
    setLocationsEdit(state, locationsEdit) {
      Vue.set(state, 'locationsEdit', [...locationsEdit]);
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
    async saveStudyRequest({ state }, studyRequest) {
      const { id } = studyRequest;
      const update = id !== undefined;

      const { csrf } = state.auth;
      if (update) {
        return putStudyRequest(csrf, studyRequest);
      }
      return postStudyRequest(csrf, studyRequest);
    },
    async saveStudyRequestBulk({ state, commit }, studyRequestBulk) {
      const { id, urgent } = studyRequestBulk;
      const update = id !== undefined;
      if (update) {
        commit('setToastInfo', REQUEST_STUDY_UPDATED.text);
      } else if (urgent) {
        commit('setDialog', {
          dialog: 'AlertStudyRequestUrgent',
          dialogData: { update },
        });
      } else {
        commit('setToastInfo', REQUEST_STUDY_SUBMITTED.text);
      }

      const { csrf } = state.auth;
      if (update) {
        return putStudyRequestBulk(csrf, studyRequestBulk);
      }
      return postStudyRequestBulk(csrf, studyRequestBulk);
    },
    async updateStudyRequests({ state }, studyRequests) {
      const { csrf } = state.auth;
      const tasks = studyRequests.map(
        studyRequest => putStudyRequest(csrf, studyRequest),
      );
      return Promise.all(tasks);
    },
    // LOCATION
    async initLocations({ commit, state }, { features, selectionType: selectionTypeNext }) {
      if (features.length > MAX_LOCATIONS) {
        commit('setToastError', `Maximum of ${MAX_LOCATIONS} selected locations.`);
        return;
      }

      const { locations, selectionType } = state.locationsSelection;
      const s1 = CompositeId.encode(locations);
      const s1Next = CompositeId.encode(features);
      if (s1 === s1Next && selectionType === selectionTypeNext) {
        return;
      }

      let locationsNext = await getLocationsByCentreline(features);
      /*
       * Since this endpoint can return `null` values, we filter those out here.  If this does
       * change the list of features, it should trigger an update of the route parameters.
       */
      locationsNext = locationsNext.filter(location => location !== null);

      const locationsSelection = {
        locations: locationsNext,
        selectionType: selectionTypeNext,
      };
      if (selectionTypeNext === LocationSelectionType.CORRIDOR) {
        try {
          locationsNext = await getLocationsByCorridor(locationsNext);
        } catch (err) {
          commit('setToastBackendError', err);
          throw err;
        }
      }

      commit('setLocationsSelection', locationsSelection);
      commit('setLocations', locationsNext);
    },
    async syncLocationsEdit({ commit, state }) {
      const { locations, selectionType } = state.locationsEditSelection;
      let locationsEdit = locations;
      if (selectionType === LocationSelectionType.CORRIDOR) {
        locationsEdit = await getLocationsByCorridor(locations);
      }
      commit('setLocationsEdit', locationsEdit);
    },
    async syncLocationsSelectionForMode({ commit, state }, locationsSelection) {
      commit('setLocationsSelectionForMode', locationsSelection);
      const commitName = state.locationMode === LocationMode.MULTI_EDIT
        ? 'setLocationsEdit'
        : 'setLocations';
      let { locations } = locationsSelection;
      if (locationsSelection.selectionType === LocationSelectionType.CORRIDOR) {
        locations = await getLocationsByCorridor(locations);
      }
      commit(commitName, locations);
    },
  },
});
