import Vue from 'vue';

import {
  COUNT_TYPES,
} from '@/lib/Constants';
import { apiFetch } from '@/lib/api/BackendClient';
import { getLocationByFeature, getUsersBySubjects } from '@/lib/api/WebApi';
import { STUDY_DUPLICATE, STUDY_IRRELEVANT_TYPE } from '@/lib/i18n/ConfirmDialog';

function makeStudy(studyType) {
  return {
    studyType,
    daysOfWeek: [2, 3, 4],
    duration: 24,
    hours: 'ROUTINE',
    notes: '',
  };
}

// TODO: DRY with index.js
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

export default {
  namespaced: true,
  state: {
    // ACTIVE STUDY REQUEST
    studyRequest: null,
    studyRequestComments: [],
    studyRequestCommentUsers: new Map(),
    studyRequestLocation: null,
  },
  getters: {
    studyRequestEstimatedDeliveryDate(state, getters, rootState) {
      const { studyRequest } = state;
      if (studyRequest === null) {
        return null;
      }
      const { now } = rootState;
      return studyRequestEstimatedDeliveryDate(now, studyRequest);
    },
    studyRequestMinDueDate(state, getters, rootState) {
      const { studyRequest } = state;
      if (studyRequest === null) {
        return null;
      }
      const { now } = rootState;
      if (studyRequest.priority === 'URGENT') {
        return now;
      }
      return now.plus({ months: 2 });
    },
    studyTypesWithWarnings(state, getters, rootState, rootGetters) {
      const studyTypesSelected = new Set();
      if (state.studyRequest !== null) {
        state.studyRequest.studies.forEach(({ studyType: value }) => {
          studyTypesSelected.add(value);
        });
      }
      return COUNT_TYPES.map(({ label, value }) => {
        let warning = null;
        if (studyTypesSelected.has(value)) {
          warning = STUDY_DUPLICATE.getModalOptions({ label });
        } else if (!rootGetters.studyTypesRelevantToLocation.includes(value)) {
          warning = STUDY_IRRELEVANT_TYPE.getModalOptions({ label });
        }
        return { label, value, warning };
      });
    },
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
        priority: 'STANDARD',
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

      let subjects = new Set();
      studyRequestComments.forEach(({ userSubject }) => {
        subjects.add(userSubject);
      });
      subjects = Array.from(subjects);
      const studyRequestCommentUsers = await getUsersBySubjects(subjects);
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
