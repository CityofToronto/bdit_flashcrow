import Vue from 'vue';

import {
  centrelineKey,
  CentrelineType,
  StudyHours,
  StudyType,
} from '@/lib/Constants';

function makeStudyRequest(now, location) {
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
  let duration = null;
  let hours = null;
  let studyType = null;
  if (centrelineType === CentrelineType.INTERSECTION) {
    hours = StudyHours.ROUTINE;
    studyType = StudyType.TMC;
  } else {
    duration = 72;
  }
  return {
    urgent: false,
    urgentReason: null,
    dueDate,
    reason: null,
    reasonOther: null,
    ccEmails: [],
    studyType,
    studyTypeOther: null,
    daysOfWeek: [2, 3, 4],
    duration,
    hours,
    notes: '',
    centrelineId,
    centrelineType,
    geom,
  };
}

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

      const { centrelineId, centrelineType } = location;
      state.indicesSelected.forEach((i) => {
        Vue.set(state.studyRequests, i, {
          ...state.studyRequests[i],
          centrelineId,
          centrelineType,
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
    async addStudyRequestAtLocation({ commit, rootState }, location) {
      const studyRequest = makeStudyRequest(rootState.now, location);
      commit('addStudyRequest', { location, studyRequest });
    },
    async saveStudyRequestBulk({ commit }) {
      commit('clearStudyRequests');
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
