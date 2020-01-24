import {
  centrelineKey,
} from '@/lib/Constants';
import BackendClient from '@/lib/api/BackendClient';

const apiClient = new BackendClient('/api');

async function deleteStudyRequests(csrf, isSupervisor, studyRequests) {
  const options = {
    method: 'DELETE',
    csrf,
  };
  if (isSupervisor) {
    options.data = { isSupervisor };
  }
  const promisesStudyRequests = studyRequests.map(
    ({ id }) => apiClient.fetch(`/requests/study/${id}`, options),
  );
  await Promise.all(promisesStudyRequests);
}

async function getCollisionsByCentrelineSummary(feature, filters) {
  const { centrelineId, centrelineType } = feature;
  const data = {
    centrelineId,
    centrelineType,
    ...filters,
  };
  const options = { data };
  return apiClient.fetch('/collisions/byCentreline/summary', options);
}

async function getCountsByCentrelineSummary(feature, filters) {
  const { centrelineId, centrelineType } = feature;
  const data = {
    centrelineId,
    centrelineType,
    ...filters,
  };
  const options = { data };
  return apiClient.fetch('/counts/byCentreline/summary', options);
}

async function getLocationsByFeature(centrelineTypesAndIds) {
  const centrelineIds = centrelineTypesAndIds.map(({ centrelineId: id }) => id);
  const centrelineTypes = centrelineTypesAndIds.map(({ centrelineType: type }) => type);
  const options = {
    data: {
      centrelineId: centrelineIds,
      centrelineType: centrelineTypes,
    },
  };
  const locations = await apiClient.fetch('/location/centreline', options);
  return new Map(locations);
}

async function getLocationByFeature(feature) {
  const locationsMap = await getLocationsByFeature([feature]);
  const { centrelineId, centrelineType } = feature;
  const key = centrelineKey(centrelineType, centrelineId);
  if (!locationsMap.has(key)) {
    // TODO: better error handling here
    throw new Error('not found!');
  }
  return locationsMap.get(key);
}


async function getLocationByKeyString(keyString) {
  const options = {
    data: { keyString },
  };
  return apiClient.fetch('/cotgeocoder/findAddressCandidates', options);
}

async function getLocationSuggestions(query) {
  if (query.startsWith('pxo:') || query.startsWith('px:')) {
    let pxStr = null;
    let signalType = null;
    if (query.startsWith('px:')) {
      pxStr = query.split('px:')[1].trim();
      signalType = 1;
    } else {
      pxStr = query.split('pxo:')[1].trim();
      signalType = 2;
    }
    const px = parseInt(pxStr, 10);
    if (Number.isNaN(px)) {
      return [];
    }
    const pxOptions = {
      data: { px, signalType },
    };
    return apiClient.fetch('/px/suggest', pxOptions);
  }
  if (query.length < 3) {
    return [];
  }
  const options = {
    data: { q: query },
  };
  return apiClient.fetch('/cotgeocoder/suggest', options);
}

async function getPoiByCentrelineSummary(feature) {
  const { centrelineId, centrelineType } = feature;
  const data = { centrelineId, centrelineType };
  const options = { data };
  return apiClient.fetch('/poi/byCentreline/summary', options);
}

async function getStudiesByCentreline(feature) {
  const { centrelineId, centrelineType } = feature;

  const dataStudies = {
    centrelineId,
    centrelineType,
  };
  const optionsStudies = { data: dataStudies };
  return apiClient.fetch('/studies/byCentreline', optionsStudies);
}

async function getUsersByIds(ids) {
  const idsArray = Array.from(ids);
  if (idsArray.length === 0) {
    return new Map();
  }
  const options = { data: { id: idsArray } };
  const users = await apiClient.fetch('/users/byId', options);
  return new Map(users);
}

async function getStudyRequest(id) {
  const [
    studyRequest,
    studyRequestComments,
  ] = await Promise.all([
    apiClient.fetch(`/requests/study/${id}`),
    apiClient.fetch(`/requests/study/${id}/comments`),
  ]);

  const { centrelineId, centrelineType } = studyRequest;
  const ids = new Set(studyRequestComments.map(({ userId }) => userId));
  const [
    studyRequestLocation,
    studyRequestCommentUsers,
  ] = await Promise.all([
    getLocationByFeature({ centrelineId, centrelineType }),
    getUsersByIds(ids),
  ]);

  return {
    studyRequest,
    studyRequestComments,
    studyRequestCommentUsers,
    studyRequestLocation,
  };
}

async function getUserStudyRequests(isSupervisor) {
  const options = {};
  if (isSupervisor) {
    options.data = { isSupervisor };
  }
  const studyRequests = await apiClient.fetch('/requests/study', options);

  const centrelineKeys = new Set();
  const centrelineIdsAndTypes = [];
  let ids = new Set();
  studyRequests.forEach(({ centrelineId, centrelineType, userId }) => {
    const key = centrelineKey(centrelineId, centrelineType);
    if (!centrelineKeys.has(key)) {
      centrelineKeys.add(key);
      centrelineIdsAndTypes.push({ centrelineId, centrelineType });
    }
    ids.add(userId);
  });
  ids = Array.from(ids);

  const promiseLocations = getLocationsByFeature(centrelineIdsAndTypes);
  const promiseUsers = getUsersByIds(ids);
  const [
    studyRequestLocations,
    studyRequestUsers,
  ] = await Promise.all([promiseLocations, promiseUsers]);

  return {
    studyRequests,
    studyRequestLocations,
    studyRequestUsers,
  };
}

async function putStudyRequests(csrf, isSupervisor, studyRequests) {
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
      csrf,
      data,
    };
    return apiClient.fetch(url, options);
  });
  return Promise.all(promisesStudyRequests);
}

const WebApi = {
  deleteStudyRequests,
  getCollisionsByCentrelineSummary,
  getCountsByCentrelineSummary,
  getLocationByFeature,
  getLocationsByFeature,
  getLocationByKeyString,
  getLocationSuggestions,
  getPoiByCentrelineSummary,
  getStudiesByCentreline,
  getStudyRequest,
  getUserStudyRequests,
  getUsersByIds,
  putStudyRequests,
};

export {
  WebApi as default,
  deleteStudyRequests,
  getCollisionsByCentrelineSummary,
  getCountsByCentrelineSummary,
  getLocationByFeature,
  getLocationsByFeature,
  getLocationByKeyString,
  getLocationSuggestions,
  getPoiByCentrelineSummary,
  getStudiesByCentreline,
  getStudyRequest,
  getUserStudyRequests,
  getUsersByIds,
  putStudyRequests,
};
