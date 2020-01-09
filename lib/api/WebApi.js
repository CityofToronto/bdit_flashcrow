import {
  centrelineKey,
} from '@/lib/Constants';
import BackendClient from '@/lib/api/BackendClient';

const MAX_PER_CATEGORY = 10;

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

async function getCountsByCentreline(feature) {
  const { centrelineId, centrelineType } = feature;

  const dataCounts = {
    centrelineId,
    centrelineType,
    maxPerCategory: MAX_PER_CATEGORY,
  };
  const optionsCounts = { data: dataCounts };

  const dataStudies = {
    centrelineId,
    centrelineType,
  };
  const optionsStudies = { data: dataStudies };

  const [
    { counts },
    studies,
  ] = await Promise.all([
    apiClient.fetch('/counts/byCentreline', optionsCounts),
    apiClient.fetch('/studies/byCentreline', optionsStudies),
  ]);

  return { counts, studies };
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

async function getUsersByIds(ids) {
  if (ids.length === 0) {
    return new Map();
  }
  const options = {
    data: {
      id: ids,
    },
  };
  const users = await apiClient.fetch('/users/byId', options);
  return new Map(users);
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
  getCountsByCentreline,
  getLocationByFeature,
  getLocationsByFeature,
  getUserStudyRequests,
  getUsersByIds,
  putStudyRequests,
};

export {
  WebApi as default,
  deleteStudyRequests,
  getCountsByCentreline,
  getLocationByFeature,
  getLocationsByFeature,
  getUserStudyRequests,
  getUsersByIds,
  putStudyRequests,
};
