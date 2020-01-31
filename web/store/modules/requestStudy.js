import Vue from 'vue';

import { apiFetch } from '@/lib/api/BackendClient';
import { getLocationByFeature, getUsersByIds } from '@/lib/api/WebApi';

function makeStudy(studyType) {
  return {
    studyType,
    daysOfWeek: [2, 3, 4],
    duration: 24,
    hours: 'ROUTINE',
    notes: '',
  };
}

export default {
  namespaced: true,
  state: {
    // ACTIVE STUDY REQUEST
    studyRequest: null,
    studyRequestComments: [],
    studyRequestCommentUsers: new Map(),
    studyRequestLocation: null,
  },
  mutations: {
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
    setNewStudyRequest(state, studyTypes) {
      const { location, now } = this.state;
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
        urgent: false,
        urgentReason: null,
        assignedTo: null,
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
    // STUDY REQUEST COMMENTS
    setStudyRequestComments(state, studyRequestComments) {
      Vue.set(state, 'studyRequestComments', studyRequestComments);
    },
    setStudyRequestCommentUsers(state, studyRequestCommentUsers) {
      Vue.set(state, 'studyRequestCommentUsers', studyRequestCommentUsers);
    },
    addStudyRequestComment(state, comment) {
      state.studyRequestComments.unshift(comment);
    },
    removeStudyRequestComment(state, i) {
      state.studyRequestComments.splice(i, 1);
    },
  },
  actions: {
    async fetchStudyRequest({ commit, dispatch }, { id }) {
      const url = `/requests/study/${id}`;
      const studyRequest = await apiFetch(url);
      commit('setStudyRequest', studyRequest);

      const {
        centrelineId,
        centrelineType,
      } = studyRequest;

      const promiseComments = await dispatch('fetchStudyRequestComments', { studyRequest });

      const promiseLocation = getLocationByFeature({ centrelineId, centrelineType });

      const [
        studyRequestComments,
        studyRequestLocation,
      ] = await Promise.all([promiseComments, promiseLocation]);

      commit('setStudyRequestLocation', studyRequestLocation);

      let ids = new Set();
      studyRequestComments.forEach(({ userId }) => {
        ids.add(userId);
      });
      ids = Array.from(ids);
      const studyRequestCommentUsers = await getUsersByIds(ids);
      commit('setStudyRequestCommentUsers', studyRequestCommentUsers);

      return {
        studyRequest,
        studyRequestComments,
        studyRequestCommentUsers,
        studyRequestLocation,
      };
    },
    // STUDY REQUEST COMMENTS
    async saveStudyRequestComment({ commit, rootState }, { studyRequest, comment }) {
      const { id: studyRequestId } = studyRequest;
      const url = `/requests/study/${studyRequestId}/comments`;
      const data = {
        ...comment,
      };
      const options = {
        method: 'POST',
        csrf: rootState.auth.csrf,
        data,
      };
      const commentNew = await apiFetch(url, options);
      commit('addStudyRequestComment', commentNew);
    },
    async fetchStudyRequestComments({ commit }, { studyRequest }) {
      const { id: studyRequestId } = studyRequest;
      const studyRequestComments = await apiFetch(`/requests/study/${studyRequestId}/comments`);
      commit('setStudyRequestComments', studyRequestComments);
      return studyRequestComments;
    },
    async updateStudyRequestComment({ rootState }, { studyRequest, comment }) {
      const { id: commentId } = comment;
      const { id: studyRequestId } = studyRequest;
      const url = `/requests/study/${studyRequestId}/comments/${commentId}`;
      const data = {
        ...comment,
      };
      const options = {
        method: 'PUT',
        csrf: rootState.auth.csrf,
        data,
      };
      return apiFetch(url, options);
    },
    async deleteStudyRequestComment({ commit, state, rootState }, { studyRequest, comment }) {
      const { id: commentId } = comment;
      const i = state.studyRequestComments.findIndex(({ id }) => id === commentId);
      if (i === -1) {
        return { success: false };
      }
      commit('removeStudyRequestComment', i);

      const { id: studyRequestId } = studyRequest;
      const url = `/requests/study/${studyRequestId}/comments/${commentId}`;
      const options = {
        method: 'DELETE',
        csrf: rootState.auth.csrf,
      };
      return apiFetch(url, options);
    },
  },
};
