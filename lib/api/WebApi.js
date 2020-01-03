import {
  centrelineKey,
} from '@/lib/Constants';
import BackendClient from '@/lib/api/BackendClient';

const apiClient = new BackendClient('/api');

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

const WebApi = {
  getLocationByFeature,
  getLocationsByFeature,
  getUsersBySubjects,
};

export {
  WebApi as default,
  getLocationByFeature,
  getLocationsByFeature,
  getUsersBySubjects,
};
