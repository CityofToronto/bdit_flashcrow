import Vue from 'vue';

import {
  centrelineKey,
  LocationSelectionType,
  ProjectMode,
  StudyType,
} from '@/lib/Constants';
import {
  deleteStudyRequestBulkRequests,
  getLocationsByCentreline,
  getLocationsByCorridor,
  getStudiesByCentrelineSummaryPerLocation,
  postStudyRequest,
  postStudyRequestBulk,
  postStudyRequestBulkFromRequests,
  postStudyRequestBulkRequests,
  putStudyRequestBulk,
  putStudyRequestBulkRequests,
} from '@/lib/api/WebApi';
import { getStudyRequestLocation } from '@/lib/geo/CentrelineUtils';
import { getGeometryMidpoint } from '@/lib/geo/GeometryUtils';
import {
  REQUEST_STUDY_SUBMITTED,
  REQUEST_STUDY_UPDATED,
} from '@/lib/i18n/Strings';
import CompositeId from '@/lib/io/CompositeId';
import { makeStudyRequest } from '@/lib/requests/RequestEmpty';

function getMostRecentByStudyType(studySummaryPerLocation, i) {
  const mostRecentByStudyType = new Map(
    StudyType.enumValues.map(studyType => [studyType, null]),
  );
  studySummaryPerLocation.forEach(({ perLocation, studyType }) => {
    const { mostRecent } = perLocation[i];
    mostRecentByStudyType.set(studyType, mostRecent);
  });
  return mostRecentByStudyType;
}

function getMostRecentByLocation(studySummaryPerLocation, locations) {
  const mostRecentByLocation = new Map();
  locations.forEach((location, i) => {
    const mostRecentByStudyType = getMostRecentByStudyType(studySummaryPerLocation, i);
    const key = centrelineKey(location);
    mostRecentByLocation.set(key, mostRecentByStudyType);
  });
  return mostRecentByLocation;
}

function getStudyRequestsMessage(studyRequests, studyRequestLocations) {
  const n = studyRequests.length;
  if (n === 0 || n > 1) {
    return `${n} study requests`;
  }
  const [studyRequest] = studyRequests;
  const key = centrelineKey(studyRequest);
  let location = null;
  if (studyRequestLocations.has(key)) {
    location = studyRequestLocations.get(key);
  }
  location = getStudyRequestLocation(studyRequest, location);
  return `request at ${location.description}`;
}

function getUpdateStudyRequestsBulkRequestsMessage(
  projectMode,
  studyRequests,
  studyRequestBulk,
  studyRequestLocations,
) {
  const studyRequestsMessage = getStudyRequestsMessage(studyRequests, studyRequestLocations);
  if (projectMode === ProjectMode.NONE) {
    return `Removed ${studyRequestsMessage} from project.`;
  }
  if (projectMode === ProjectMode.CREATE_NEW) {
    return `Created project with ${studyRequestsMessage}: ${studyRequestBulk.name}`;
  }
  if (projectMode === ProjectMode.ADD_TO_EXISTING) {
    return `Adding ${studyRequestsMessage} to project: ${studyRequestBulk.name}`;
  }
  throw new Error(`invalid project mode: ${projectMode}`);
}

export default {
  namespaced: true,
  state: {
    indicesSelected: [],
    mostRecentByLocation: new Map(),
    studyRequestLocations: new Map(),
    studyRequests: [],
  },
  getters: {
    locations(state) {
      return state.studyRequests.map((studyRequest) => {
        const key = centrelineKey(studyRequest);
        let location = null;
        if (state.studyRequestLocations.has(key)) {
          location = state.studyRequestLocations.get(key);
        }
        return getStudyRequestLocation(studyRequest, location);
      });
    },
    mostRecents(state) {
      return state.studyRequests.map((studyRequest) => {
        const key = centrelineKey(studyRequest);
        if (!state.mostRecentByLocation.has(key)) {
          return new Map(
            StudyType.enumValues.map(studyType => [studyType, null]),
          );
        }
        return state.mostRecentByLocation.get(key);
      });
    },
  },
  mutations: {
    addStudyRequest(state, { location, mostRecentByStudyType, studyRequest }) {
      const key = centrelineKey(location);
      state.mostRecentByLocation.set(key, mostRecentByStudyType);
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
    setMostRecentByLocation(state, mostRecentByLocation) {
      state.mostRecentByLocation = mostRecentByLocation;
    },
    setStudyRequests(state, { locations, mostRecentByLocation, studyRequests }) {
      state.indicesSelected = [];
      state.mostRecentByLocation = mostRecentByLocation;
      locations.forEach((location) => {
        const key = centrelineKey(location);
        state.studyRequestLocations.set(key, location);
      });
      state.studyRequests = studyRequests;
    },
    updateSelectedStudyRequests(state, { location, mostRecentByStudyType }) {
      const key = centrelineKey(location);
      state.mostRecentByLocation.set(key, mostRecentByStudyType);
      state.studyRequestLocations.set(key, location);

      const { centrelineId, centrelineType, geom: geomLocation } = location;
      const coordinates = getGeometryMidpoint(geomLocation);
      const geom = { type: 'Point', coordinates };
      state.indicesSelected.forEach((i) => {
        Vue.set(state.studyRequests, i, {
          ...state.studyRequests[i],
          centrelineId,
          centrelineType,
          geom,
        });
      });
    },
  },
  actions: {
    async addStudyRequestAtLocation({ commit, rootState }, location) {
      const studyRequest = makeStudyRequest(rootState.now, location);

      const studySummaryPerLocation = await getStudiesByCentrelineSummaryPerLocation(
        [location],
        {},
      );
      const mostRecentByStudyType = getMostRecentByStudyType(studySummaryPerLocation, 0);

      commit('addStudyRequest', { location, mostRecentByStudyType, studyRequest });
    },
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
        commit('setToastInfo', REQUEST_STUDY_SUBMITTED.text, { root: true });
      }

      return result;
    },
    async setSelectedStudyRequestsLocation({ commit }, location) {
      const studySummaryPerLocation = await getStudiesByCentrelineSummaryPerLocation(
        [location],
        {},
      );
      const mostRecentByStudyType = getMostRecentByStudyType(studySummaryPerLocation, 0);
      commit('updateSelectedStudyRequests', { location, mostRecentByStudyType });
    },
    async setStudyRequestsForLocationsSelection({ commit, rootState }, locationsSelection) {
      commit('clearStudyRequests');

      const { s1, selectionType } = locationsSelection;
      const features = CompositeId.decode(s1);
      let locations = await getLocationsByCentreline(features);
      locations = locations.filter(location => location !== null);
      if (selectionType === LocationSelectionType.CORRIDOR) {
        try {
          locations = await getLocationsByCorridor(locations);
        } catch (err) {
          commit('setToastBackendError', err, { root: true });
          throw err;
        }
      }

      const studySummaryPerLocation = await getStudiesByCentrelineSummaryPerLocation(
        locations,
        {},
      );
      const mostRecentByLocation = getMostRecentByLocation(studySummaryPerLocation, locations);

      const studyRequests = locations.map(
        location => makeStudyRequest(rootState.now, location),
      );
      commit('setStudyRequests', { locations, mostRecentByLocation, studyRequests });
    },
    async setStudyRequestsForStudyRequest({ commit }, studyRequest) {
      commit('clearStudyRequests');

      const { centrelineId, centrelineType } = studyRequest;
      const feature = { centrelineId, centrelineType };
      let locations = await getLocationsByCentreline([feature]);
      locations = locations.filter(location => location !== null);

      const studySummaryPerLocation = await getStudiesByCentrelineSummaryPerLocation(
        locations,
        {},
      );
      const mostRecentByLocation = getMostRecentByLocation(studySummaryPerLocation, locations);

      const studyRequests = [studyRequest];
      commit('setStudyRequests', { locations, mostRecentByLocation, studyRequests });
    },
    async setStudyRequestsForStudyRequestBulk({ commit }, studyRequestBulk) {
      commit('clearStudyRequests');

      const { studyRequests } = studyRequestBulk;
      const features = studyRequests.map(
        ({ centrelineId, centrelineType }) => ({ centrelineId, centrelineType }),
      );
      let locations = await getLocationsByCentreline(features);
      locations = locations.filter(location => location !== null);

      const studySummaryPerLocation = await getStudiesByCentrelineSummaryPerLocation(
        locations,
        {},
      );
      const mostRecentByLocation = getMostRecentByLocation(studySummaryPerLocation, locations);

      commit('setStudyRequests', { locations, mostRecentByLocation, studyRequests });
    },
    async updateStudyRequestBulk({ commit, rootState }, studyRequestBulk) {
      const { csrf } = rootState.auth;
      commit('setToastInfo', REQUEST_STUDY_UPDATED.text, { root: true });
      return putStudyRequestBulk(csrf, studyRequestBulk);
    },
    async updateStudyRequestsBulkRequests(
      { commit, rootState },
      {
        projectMode,
        studyRequests,
        studyRequestBulk,
        studyRequestLocations,
      },
    ) {
      const { csrf } = rootState.auth;
      let result = null;
      if (projectMode === ProjectMode.NONE) {
        result = await deleteStudyRequestBulkRequests(csrf, studyRequests);
      } else if (projectMode === ProjectMode.CREATE_NEW) {
        result = await postStudyRequestBulkFromRequests(csrf, studyRequestBulk, studyRequests);
      } else if (projectMode === ProjectMode.ADD_TO_EXISTING) {
        result = await putStudyRequestBulkRequests(csrf, studyRequestBulk, studyRequests);
      }

      const msg = getUpdateStudyRequestsBulkRequestsMessage(
        projectMode,
        studyRequests,
        studyRequestBulk,
        studyRequestLocations,
      );
      commit('setToastInfo', msg, { root: true });

      return result;
    },
  },
};
