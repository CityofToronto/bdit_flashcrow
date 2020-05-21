import {
  centrelineKey,
  POI_RADIUS,
  ReportBlock,
  ReportFormat,
  ReportType,
} from '@/lib/Constants';
import BackendClient from '@/lib/api/BackendClient';
import AuthState from '@/lib/model/AuthState';
import Category from '@/lib/model/Category';
import CollisionEvent from '@/lib/model/CollisionEvent';
import Count from '@/lib/model/Count';
import Joi from '@/lib/model/Joi';
import StudyRequest from '@/lib/model/StudyRequest';
import StudyRequestChange from '@/lib/model/StudyRequestChange';
import StudyRequestComment from '@/lib/model/StudyRequestComment';
import SuccessResponse from '@/lib/model/SuccessResponse';
import User from '@/lib/model/User';

const apiClient = new BackendClient('/api');
const reporterClient = new BackendClient('/reporter');

async function deleteStudyRequestComment(csrf, studyRequest, comment) {
  const { id: commentId } = comment;
  const { id: studyRequestId } = studyRequest;
  const url = `/requests/study/${studyRequestId}/comments/${commentId}`;
  const options = {
    method: 'DELETE',
    csrf,
  };
  const response = await apiClient.fetch(url, options);
  const responseSchema = Joi.object().keys({
    studyRequest: StudyRequest.read,
    studyRequestComment: SuccessResponse,
  });
  return responseSchema.validateAsync(response);
}

async function getAuth() {
  const auth = await apiClient.fetch('/auth');
  return AuthState.read.validateAsync(auth);
}

async function getCollisionByCollisionId(collisionId) {
  const collision = await apiClient.fetch(`/collisions/${collisionId}`);
  return CollisionEvent.read.validateAsync(collision);
}

async function getCollisionsByCentreline(feature, filters) {
  const { centrelineId, centrelineType } = feature;
  const data = {
    centrelineId,
    centrelineType,
    ...filters,
  };
  const options = { data };
  const collisions = await apiClient.fetch('/collisions/byCentreline', options);
  const collisionsSchema = Joi.array().items(CollisionEvent.read);
  return collisionsSchema.validateAsync(collisions);
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

async function getCollisionsByCentrelineTotal(feature) {
  const { centrelineId, centrelineType } = feature;
  const data = { centrelineId, centrelineType };
  const options = { data };
  const { total } = await apiClient.fetch('/collisions/byCentreline/total', options);
  return total;
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

async function getCountsByCentrelineTotal(feature) {
  const { centrelineId, centrelineType } = feature;
  const data = { centrelineId, centrelineType };
  const options = { data };
  const { total } = await apiClient.fetch('/counts/byCentreline/total', options);
  return total;
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
  const data = { centrelineId, centrelineType, radius: POI_RADIUS };
  const options = { data };
  return apiClient.fetch('/poi/byCentreline/summary', options);
}

async function getReport(type, id, format, reportParameters) {
  const options = {
    method: 'GET',
    data: {
      type,
      id,
      format,
      ...reportParameters,
    },
  };
  return reporterClient.fetch('/reports', options);
}

async function getReportWeb(type, id, reportParameters) {
  const {
    type: reportTypeStr,
    date: reportDate,
    content,
  } = await getReport(type, id, ReportFormat.WEB, reportParameters);

  const reportType = ReportType.enumValueOf(reportTypeStr);
  const reportContent = content.map((contentRow) => {
    if (Array.isArray(contentRow)) {
      return contentRow.map(({ type: blockTypeStr, options: blockOptions }) => {
        const blockType = ReportBlock.enumValueOf(blockTypeStr);
        return {
          type: blockType,
          options: blockOptions,
        };
      });
    }
    const { type: blockTypeStr, options: blockOptions } = contentRow;
    const blockType = ReportBlock.enumValueOf(blockTypeStr);
    return {
      type: blockType,
      options: blockOptions,
    };
  });
  return {
    type: reportType,
    date: reportDate,
    content: reportContent,
  };
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
    studyRequestChanges,
    studyRequestComments,
  ] = await Promise.all([
    apiClient.fetch(`/requests/study/${id}`),
    apiClient.fetch(`/requests/study/${id}/changes`),
    apiClient.fetch(`/requests/study/${id}/comments`),
  ]);

  const studyRequestSchema = StudyRequest.read;
  studyRequest = await studyRequestSchema.validateAsync(studyRequest);

  const studyRequestChangesSchema = Joi.array().items(StudyRequestChange.read);
  studyRequestChanges = await studyRequestChangesSchema.validateAsync(studyRequestChanges);

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
    studyRequestChanges,
    studyRequestComments,
    studyRequestLocation,
    studyRequestUsers,
  };
}

async function getStudyRequests() {
  let studyRequests = await apiClient.fetch('/requests/study');

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

async function getStudyRequestsByCentrelinePending(feature) {
  const { centrelineId, centrelineType } = feature;

  const data = {
    centrelineId,
    centrelineType,
  };
  const options = { data };
  const studyRequests = await apiClient.fetch('/requests/study/byCentreline/pending', options);
  const studyRequestsSchema = Joi.array().items(StudyRequest.read);
  return studyRequestsSchema.validateAsync(studyRequests);
}

async function getUsers() {
  const users = await apiClient.fetch('/users');
  const usersSchema = Joi.array().items(User.read);
  return usersSchema.validateAsync(users);
}

async function postStudyRequest(csrf, studyRequest) {
  const options = {
    method: 'POST',
    csrf,
    data: studyRequest,
  };
  const persistedStudyRequest = await apiClient.fetch('/requests/study', options);
  return StudyRequest.read.validateAsync(persistedStudyRequest);
}

async function postStudyRequestComment(csrf, studyRequest, comment) {
  const { id: studyRequestId } = studyRequest;
  const url = `/requests/study/${studyRequestId}/comments`;
  const options = {
    method: 'POST',
    csrf,
    data: comment,
  };
  const response = await apiClient.fetch(url, options);
  const responseSchema = Joi.object().keys({
    studyRequest: StudyRequest.read,
    studyRequestComment: StudyRequestComment.read,
  });
  return responseSchema.validateAsync(response);
}

async function putStudyRequest(csrf, studyRequest) {
  const { id: studyRequestId } = studyRequest;
  const url = `/requests/study/${studyRequestId}`;
  const options = {
    method: 'PUT',
    csrf,
    data: studyRequest,
  };
  const response = await apiClient.fetch(url, options);
  const responseSchema = Joi.object().keys({
    studyRequest: StudyRequest.read,
    studyRequestChange: StudyRequestChange.read.allow(null),
  });
  return responseSchema.validateAsync(response);
}

async function putStudyRequestComment(csrf, studyRequest, comment) {
  const { id: commentId } = comment;
  const { id: studyRequestId } = studyRequest;
  const url = `/requests/study/${studyRequestId}/comments/${commentId}`;
  const options = {
    method: 'PUT',
    csrf,
    data: comment,
  };

  const response = await apiClient.fetch(url, options);
  const responseSchema = Joi.object().keys({
    studyRequest: StudyRequest.read,
    studyRequestComment: StudyRequestComment.read,
  });
  return responseSchema.validateAsync(response);
}

async function putUser(csrf, user) {
  const { id: userId } = user;
  const url = `/users/${userId}`;
  const options = {
    method: 'PUT',
    csrf,
    data: user,
  };

  const persistedUser = await apiClient.fetch(url, options);
  return User.read.validateAsync(persistedUser);
}

const WebApi = {
  deleteStudyRequestComment,
  getAuth,
  getCollisionByCollisionId,
  getCollisionsByCentreline,
  getCollisionsByCentrelineSummary,
  getCollisionsByCentrelineTotal,
  getCountsByCentreline,
  getCountsByCentrelineSummary,
  getCountsByCentrelineTotal,
  getLocationByFeature,
  getLocationsByFeature,
  getLocationSuggestions,
  getPoiByCentrelineSummary,
  getReport,
  getReportWeb,
  getStudyRequest,
  getStudyRequests,
  getStudyRequestsByCentrelinePending,
  getUsers,
  getUsersByIds,
  postStudyRequest,
  postStudyRequestComment,
  putStudyRequest,
  putStudyRequestComment,
  putUser,
};

export {
  WebApi as default,
  deleteStudyRequestComment,
  getAuth,
  getCollisionByCollisionId,
  getCollisionsByCentreline,
  getCollisionsByCentrelineSummary,
  getCollisionsByCentrelineTotal,
  getCountsByCentreline,
  getCountsByCentrelineSummary,
  getCountsByCentrelineTotal,
  getLocationByFeature,
  getLocationsByFeature,
  getLocationSuggestions,
  getPoiByCentrelineSummary,
  getReport,
  getReportWeb,
  getStudyRequest,
  getStudyRequests,
  getStudyRequestsByCentrelinePending,
  getUsers,
  getUsersByIds,
  postStudyRequest,
  postStudyRequestComment,
  putStudyRequest,
  putStudyRequestComment,
  putUser,
};
