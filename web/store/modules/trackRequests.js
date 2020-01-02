import Vue from 'vue';

import { apiFetch } from '@/lib/BackendClient';
import {
  centrelineKey,
} from '@/lib/Constants';

export default {
  namespaced: true,
  state: {
    studyRequests: [],
    studyRequestLocations: new Map(),
    studyRequestUsers: new Map(),
  },
  getters: {
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
  },
  mutations: {
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
  },
  actions: {
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

      const promiseLocations = dispatch(
        'fetchLocationsFromCentreline',
        centrelineIdsAndTypes,
        { root: true },
      );
      const promiseUsers = dispatch(
        'fetchUsersBySubjects',
        subjects,
        { root: true },
      );
      const [
        studyRequestLocations,
        studyRequestUsers,
      ] = await Promise.all([promiseLocations, promiseUsers]);
      commit('setStudyRequestLocations', studyRequestLocations);
      commit('setStudyRequestUsers', studyRequestUsers);

      return {
        studyRequests,
        studyRequestLocations,
        studyRequestUsers,
      };
    },
    async updateStudyRequests({ rootState }, { isSupervisor, studyRequests }) {
      const promisesStudyRequests = studyRequests.map((studyRequest) => {
        const data = {
          ...studyRequest,
        };
        if (isSupervisor) {
          data.isSupervisor = isSupervisor;
        }
        const url = `/requests/study/${data.id}`;
        const options = {
          method: 'PUT',
          csrf: rootState.auth.csrf,
          data,
        };
        return apiFetch(url, options);
      });
      return Promise.all(promisesStudyRequests);
    },
    async deleteStudyRequests({ dispatch, rootState }, { isSupervisor, studyRequests }) {
      const options = {
        method: 'DELETE',
        csrf: rootState.auth.csrf,
      };
      if (isSupervisor) {
        options.data = { isSupervisor };
      }
      const promisesStudyRequests = studyRequests.map(
        ({ id }) => apiFetch(`/requests/study/${id}`, options),
      );
      await Promise.all(promisesStudyRequests);
      await dispatch('fetchAllStudyRequests');
    },
  },
};
