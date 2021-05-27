import Vue from 'vue';

import { centrelineKey, ProjectMode } from '@/lib/Constants';
import {
  postStudyRequest,
  postStudyRequestBulk,
  postStudyRequestBulkRequests,
} from '@/lib/api/WebApi';
import {
  REQUEST_STUDY_SUBMITTED,
} from '@/lib/i18n/Strings';
import { makeStudyRequest } from '@/lib/requests/RequestEmpty';

export default {
  namespaced: true,
  state: {
    indicesSelected: [],
    studyRequestLocations: new Map(),
    studyRequests: [],
  },
  getters: {
    locations(state) {
      return state.studyRequests.map((studyRequest) => {
        const key = centrelineKey(studyRequest);
        return state.studyRequestLocations.get(key);
      });
    },
  },
  mutations: {
    addStudyRequest(state, { location, studyRequest }) {
      const key = centrelineKey(location);
      state.studyRequestLocations.set(key, location);
      state.studyRequests.push(studyRequest);
    },
    clearStudyRequests(state) {
      state.indicesSelected = [];
      state.studyRequestLocations = new Map();
      state.studyRequests = [];
    },
    removeStudyRequest(state, i0) {
      state.indicesSelected = state.indicesSelected
        .filter(i => i !== i0)
        .map(i => (i > i0 ? i - 1 : i));
      state.studyRequests.splice(i0, 1);
    },
    setIndicesSelected(state, indicesSelected) {
      state.indicesSelected = indicesSelected;
    },
    setSelectedStudyRequestsLocation(state, location) {
      const key = centrelineKey(location);
      state.studyRequestLocations.set(key, location);

      const { centrelineId, centrelineType, geom } = location;
      state.indicesSelected.forEach((i) => {
        Vue.set(state.studyRequests, i, {
          ...state.studyRequests[i],
          centrelineId,
          centrelineType,
          geom,
        });
      });
    },
    setStudyRequests(state, { locations, studyRequests }) {
      state.indicesSelected = [];
      locations.forEach((location) => {
        const key = centrelineKey(location);
        state.studyRequestLocations.set(key, location);
      });
      state.studyRequests = studyRequests;
    },
  },
  actions: {
    async createStudyRequests({ commit, rootState, state }, { projectMode, studyRequestBulk }) {
      const { studyRequests } = state;
      const { csrf } = rootState.auth;

      let result = null;
      if (projectMode === ProjectMode.NONE) {
        const n = studyRequests.length;
        for (let i = 0; i < n; i++) {
          const studyRequest = studyRequests[i];
          /* eslint-disable-next-line no-await-in-loop */
          await postStudyRequest(csrf, studyRequest);
        }
      } else if (projectMode === ProjectMode.CREATE_NEW) {
        result = await postStudyRequestBulk(csrf, { ...studyRequestBulk, studyRequests });
      } else if (projectMode === ProjectMode.ADD_TO_EXISTING) {
        result = await postStudyRequestBulkRequests(csrf, studyRequestBulk, studyRequests);
      }

      const { urgent } = studyRequests[0];
      if (urgent) {
        commit('setDialog', {
          dialog: 'AlertStudyRequestUrgent',
          dialogData: { update: false },
        }, { root: true });
      } else {
        commit('setToastInfo', REQUEST_STUDY_SUBMITTED.text);
      }

      return result;
    },
    async addStudyRequestAtLocation({ commit, rootState }, location) {
      const studyRequest = makeStudyRequest(rootState.now, location);
      commit('addStudyRequest', { location, studyRequest });
    },
    async setStudyRequestsAtLocations({ commit, rootState }, locations) {
      commit('clearStudyRequests');
      const studyRequests = locations.map(
        location => makeStudyRequest(rootState.now, location),
      );
      commit('setStudyRequests', { locations, studyRequests });
    },
  },
};
