import {
  centrelineKey,
} from '@/lib/Constants';
import BackendClient from '@/lib/api/BackendClient';
import Category from '@/lib/model/Category';
import Count from '@/lib/model/Count';
import Joi from '@/lib/model/Joi';
import Study from '@/lib/model/Study';
import StudyRequest from '@/lib/model/StudyRequest';
import StudyRequestComment from '@/lib/model/StudyRequestComment';
import SuccessResponse from '@/lib/model/SuccessResponse';
import User from '@/lib/model/User';

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
  const results = await Promise.all(promisesStudyRequests);
  const schema = Joi.array().items(SuccessResponse);
  return schema.validateAsync(results);
}

async function deleteStudyRequestComment(csrf, studyRequest, comment) {
  const { id: commentId } = comment;
  const { id: studyRequestId } = studyRequest;
  const url = `/requests/study/${studyRequestId}/comments/${commentId}`;
  const options = {
    method: 'DELETE',
    csrf,
  };
  const result = await apiClient.fetch(url, options);
  return SuccessResponse.validateAsync(result);
}

async function getCollisionPopupDetails(id) {
  return apiClient.fetch(`/collisions/${id}/popupDetails`);
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

async function getCountsByCentreline(feature, studyType, filters) {
  const { centrelineId, centrelineType } = feature;
  const data = {
    centrelineId,
    centrelineType,
    ...filters,
  };
  const options = { data };
  const counts = await apiClient.fetch(`/counts/byCentreline/${studyType}`, options);
  const countsSchema = Joi.array().items(Count.read);
  return countsSchema.validateAsync(counts);
}

async function getCountsByCentrelineSummary(feature, filters) {
  const { centrelineId, centrelineType } = feature;
  const data = {
    centrelineId,
    centrelineType,
    ...filters,
  };
  const options = { data };
  const summary = await apiClient.fetch('/counts/byCentreline/summary', options);
  const summarySchema = Joi.array().items(
    Joi.object().keys({
      category: Category.read,
      count: Count.read,
      numPerCategory: Joi.number().integer().positive().required(),
    }),
  );
  return summarySchema.validateAsync(summary);
}

async function getLocationsByFeature(centrelineTypesAndIds) {
  if (centrelineTypesAndIds.length === 0) {
    return new Map();
  }
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

async function getLocationSuggestions(query) {
  if (query.length < 3) {
    return [];
  }
  const options = {
    data: { limit: 10, q: query },
  };
  return apiClient.fetch('/location/suggest', options);
}

async function getPoiByCentrelineSummary(feature) {
  const { centrelineId, centrelineType } = feature;
  const data = { centrelineId, centrelineType };
  const options = { data };
  return apiClient.fetch('/poi/byCentreline/summary', options);
}

async function getStudiesByCentrelinePending(feature) {
  const { centrelineId, centrelineType } = feature;

  const dataStudies = {
    centrelineId,
    centrelineType,
  };
  const optionsStudies = { data: dataStudies };
  const studies = await apiClient.fetch('/studies/byCentreline/pending', optionsStudies);
  const studiesSchema = Joi.array().items(Study.read);
  return studiesSchema.validateAsync(studies);
}

async function getUsersByIds(ids) {
  const idsArray = Array.from(ids);
  if (idsArray.length === 0) {
    return new Map();
  }
  const options = { data: { id: idsArray } };
  let users = await apiClient.fetch('/users/byId', options);

  const usersSchema = Joi.array().items(
    Joi.array().ordered(
      Joi.number().integer().positive().required(),
      User.read,
    ),
  );
  users = await usersSchema.validateAsync(users);

  return new Map(users);
}

async function getStudyRequest(id) {
  let [
    studyRequest,
    studyRequestComments,
  ] = await Promise.all([
    apiClient.fetch(`/requests/study/${id}`),
    apiClient.fetch(`/requests/study/${id}/comments`),
  ]);

  const studyRequestSchema = StudyRequest.read;
  studyRequest = await studyRequestSchema.validateAsync(studyRequest);

  const studyRequestCommentsSchema = Joi.array().items(StudyRequestComment.read);
  studyRequestComments = await studyRequestCommentsSchema.validateAsync(studyRequestComments);

  const {
    centrelineId,
    centrelineType,
    lastEditorId,
    userId,
  } = studyRequest;
  const ids = new Set(studyRequestComments.map(({ userId: commentUserId }) => commentUserId));
  if (lastEditorId !== null) {
    ids.add(lastEditorId);
  }
  ids.add(userId);
  const [
    studyRequestLocation,
    studyRequestUsers,
  ] = await Promise.all([
    getLocationByFeature({ centrelineId, centrelineType }),
    getUsersByIds(ids),
  ]);

  return {
    studyRequest,
    studyRequestComments,
    studyRequestLocation,
    studyRequestUsers,
  };
}

async function getUserStudyRequests(isSupervisor) {
  const options = {};
  if (isSupervisor) {
    options.data = { isSupervisor };
  }
  let studyRequests = await apiClient.fetch('/requests/study', options);

  const studyRequestsSchema = Joi.array().items(StudyRequest.read);
  studyRequests = await studyRequestsSchema.validateAsync(studyRequests);

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

async function postStudyRequestComment(csrf, studyRequest, comment) {
  const { id: studyRequestId } = studyRequest;
  const url = `/requests/study/${studyRequestId}/comments`;
  const data = {
    ...comment,
  };
  const options = {
    method: 'POST',
    csrf,
    data,
  };
  const persistedComment = await apiClient.fetch(url, options);
  return StudyRequestComment.read.validateAsync(persistedComment);
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
  let studyRequestsUpdated = await Promise.all(promisesStudyRequests);

  const studyRequestsSchema = Joi.array().items(StudyRequest.read);
  studyRequestsUpdated = await studyRequestsSchema.validateAsync(studyRequestsUpdated);

  return studyRequestsUpdated;
}

async function putStudyRequestComment(csrf, studyRequest, comment) {
  const { id: commentId } = comment;
  const { id: studyRequestId } = studyRequest;
  const url = `/requests/study/${studyRequestId}/comments/${commentId}`;
  const data = {
    ...comment,
  };
  const options = {
    method: 'PUT',
    csrf,
    data,
  };

  const persistedComment = await apiClient.fetch(url, options);
  return StudyRequestComment.read.validateAsync(persistedComment);
}

const WebApi = {
  deleteStudyRequests,
  deleteStudyRequestComment,
  getCollisionPopupDetails,
  getCollisionsByCentrelineSummary,
  getCountsByCentreline,
  getCountsByCentrelineSummary,
  getLocationByFeature,
  getLocationsByFeature,
  getLocationSuggestions,
  getPoiByCentrelineSummary,
  getStudiesByCentrelinePending,
  getStudyRequest,
  getUserStudyRequests,
  getUsersByIds,
  postStudyRequestComment,
  putStudyRequests,
  putStudyRequestComment,
};

export {
  WebApi as default,
  deleteStudyRequests,
  deleteStudyRequestComment,
  getCollisionPopupDetails,
  getCollisionsByCentrelineSummary,
  getCountsByCentreline,
  getCountsByCentrelineSummary,
  getLocationByFeature,
  getLocationsByFeature,
  getLocationSuggestions,
  getPoiByCentrelineSummary,
  getStudiesByCentrelinePending,
  getStudyRequest,
  getUserStudyRequests,
  getUsersByIds,
  postStudyRequestComment,
  putStudyRequests,
  putStudyRequestComment,
};
