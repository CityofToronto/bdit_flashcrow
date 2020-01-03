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

async function getUsersBySubjects(subjects) {
  if (subjects.length === 0) {
    return new Map();
  }
  const options = {
    data: {
      subject: subjects,
    },
  };
  const users = await apiClient.fetch('/users/bySubject', options);
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

  const promiseLocations = getLocationsByFeature(centrelineIdsAndTypes);
  const promiseUsers = getUsersBySubjects(subjects);
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
  getLocationByFeature,
  getLocationsByFeature,
  getUserStudyRequests,
  getUsersBySubjects,
  putStudyRequests,
};

export {
  WebApi as default,
  deleteStudyRequests,
  getLocationByFeature,
  getLocationsByFeature,
  getUserStudyRequests,
  getUsersBySubjects,
  putStudyRequests,
};
