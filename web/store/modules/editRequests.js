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
      state.studyRequestLocations = new Map();
      state.studyRequests = [];
    },
    removeStudyRequest(state, i) {
      state.studyRequests.splice(i, 1);
    },
    setIndicesSelected(state, indicesSelected) {
      state.indicesSelected = indicesSelected;
    },
    setStudyRequests(state, { locations, studyRequests }) {
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
