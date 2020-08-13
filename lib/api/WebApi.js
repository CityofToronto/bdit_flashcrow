import {
  centrelineKey,
  POI_RADIUS,
  ReportBlock,
  ReportFormat,
  ReportType,
} from '@/lib/Constants';
import BackendClient from '@/lib/api/BackendClientNew';
import CompositeId from '@/lib/io/CompositeId';
import AuthState from '@/lib/model/AuthState';
import Category from '@/lib/model/Category';
import CollisionEvent from '@/lib/model/CollisionEvent';
import Joi from '@/lib/model/Joi';
import Study from '@/lib/model/Study';
import StudyRequest from '@/lib/model/StudyRequest';
import StudyRequestChange from '@/lib/model/StudyRequestChange';
import StudyRequestComment from '@/lib/model/StudyRequestComment';
import SuccessResponse from '@/lib/model/SuccessResponse';
import User from '@/lib/model/User';
import CentrelineLocation from '@/lib/model/helpers/CentrelineLocation';
import DateTime from '@/lib/time/DateTime';

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

async function getCollisionsByCentreline(features, filters) {
  const s1 = CompositeId.encode(features);
  const data = { s1, ...filters };
  const options = { data };
  const collisions = await apiClient.fetch('/collisions/byCentreline', options);
  const collisionsSchema = Joi.array().items(CollisionEvent.read);
  return collisionsSchema.validateAsync(collisions);
}

async function getCollisionsByCentrelineSummary(features, filters) {
  const s1 = CompositeId.encode(features);
  const data = { s1, ...filters };
  const options = { data };
  return apiClient.fetch('/collisions/byCentreline/summary', options);
}

async function getCollisionsByCentrelineSummaryPerLocation(features, filters) {
  const s1 = CompositeId.encode(features);
  const data = { s1, ...filters };
  const options = { data };
  return apiClient.fetch('/collisions/byCentreline/summaryPerLocation', options);
}

async function getCollisionsByCentrelineTotal(features) {
  const s1 = CompositeId.encode(features);
  const data = { s1 };
  const options = { data };
  const { total } = await apiClient.fetch('/collisions/byCentreline/total', options);
  return total;
}

async function getLocationsByCentreline(features) {
  if (features.length === 0) {
    return [];
  }
  const s1 = CompositeId.encode(features);
  const data = { s1 };
  const options = { data };
  const locations = await apiClient.fetch('/locations/byCentreline', options);
  const locationsSchema = Joi.array().items(CentrelineLocation);
  return locationsSchema.validateAsync(locations);
}

async function getLocationByCentreline(feature) {
  const locations = await getLocationsByCentreline([feature]);
  const [location] = locations;
  return location;
}

async function getLocationsByCorridor(features) {
  if (features.length === 0) {
    return [];
  }
  const s1 = CompositeId.encode(features);
  const data = { s1 };
  const options = { data };
  const locations = await apiClient.fetch('/locations/byCorridor', options);
  const locationsSchema = Joi.array().items(CentrelineLocation);
  return locationsSchema.validateAsync(locations);
}

async function getLocationSuggestions(query, filters) {
  if (query.length < 3) {
    return [];
  }
  const options = {
    data: {
      limit: 10,
      q: query,
      ...filters,
    },
  };
  const locations = await apiClient.fetch('/locations/suggest', options);
  const locationsSchema = Joi.array().items(CentrelineLocation);
  return locationsSchema.validateAsync(locations);
}

async function getPoiByCentrelineSummary(feature) {
  const { centrelineId, centrelineType } = feature;
  const data = { centrelineId, centrelineType, radius: POI_RADIUS };
  const options = { data };
  return apiClient.fetch('/poi/byCentreline/summary', options);
}

async function getReport(type, id, format, reportParameters) {
  const responseType = format.mimeType === 'application/json' ? 'json' : 'blob';
  const options = {
    method: 'GET',
    data: {
      type,
      id,
      format,
      ...reportParameters,
    },
    responseType,
  };
  return reporterClient.fetch('/reports', options);
}

async function getReportWeb(type, id, reportParameters) {
  const {
    type: reportTypeStr,
    date,
    content,
  } = await getReport(type, id, ReportFormat.WEB, reportParameters);

  const reportType = ReportType.enumValueOf(reportTypeStr);
  const reportDate = DateTime.fromJSON(date);
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

async function getStudiesByCentreline(features, studyType, filters, pagination) {
  const s1 = CompositeId.encode(features);
  const data = { s1, ...filters, ...pagination };
  const options = { data };
  const studies = await apiClient.fetch('/studies/byCentreline', options);
  const studiesSchema = Joi.array().items(Study.read);
  return studiesSchema.validateAsync(studies);
}

async function getStudiesByCentrelineSummary(features, filters) {
  const s1 = CompositeId.encode(features);
  const data = { s1, ...filters };
  const options = { data };
  const studySummary = await apiClient.fetch('/studies/byCentreline/summary', options);
  const studySummarySchema = Joi.array().items(
    Joi.object().keys({
      category: Category.read,
      mostRecent: Study.read,
      n: Joi.number().integer().positive().required(),
    }),
  );
  return studySummarySchema.validateAsync(studySummary);
}

async function getStudiesByCentrelineSummaryPerLocation(features, filters) {
  const s1 = CompositeId.encode(features);
  const data = { s1, ...filters };
  const options = { data };
  const studySummaryPerLocation = await apiClient.fetch(
    '/studies/byCentreline/summaryPerLocation',
    options,
  );
  const studySummaryPerLocationSchema = Joi.array().items(
    Joi.object().keys({
      category: Category.read,
      perLocation: Joi.array().items(
        Joi.object().keys({
          mostRecent: Study.read.allow(null),
          n: Joi.number().integer().min(0).required(),
        }),
      ),
    }),
  );
  return studySummaryPerLocationSchema.validateAsync(studySummaryPerLocation);
}

async function getStudiesByCentrelineTotal(features) {
  const s1 = CompositeId.encode(features);
  const data = { s1 };
  const options = { data };
  const { total } = await apiClient.fetch('/studies/byCentreline/total', options);
  return total;
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
    getLocationByCentreline({ centrelineId, centrelineType }),
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
  const features = [];
  let userIds = new Set();
  studyRequests.forEach(({ centrelineId, centrelineType, userId }) => {
    const key = centrelineKey(centrelineId, centrelineType);
    if (!centrelineKeys.has(key)) {
      centrelineKeys.add(key);
      features.push({ centrelineId, centrelineType });
    }
    userIds.add(userId);
  });
  userIds = Array.from(userIds);

  const promiseLocations = getLocationsByCentreline(features);
  const promiseUsers = getUsersByIds(userIds);
  const [
    studyRequestLocations,
    studyRequestUsers,
  ] = await Promise.all([promiseLocations, promiseUsers]);
  const studyRequestLocationsMap = new Map(studyRequestLocations.map(
    location => [centrelineKey(location), location],
  ));

  return {
    studyRequests,
    studyRequestLocations: studyRequestLocationsMap,
    studyRequestUsers,
  };
}

async function getStudyRequestsByCentrelinePending(features) {
  const s1 = CompositeId.encode(features);
  const data = { s1 };
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
  getCollisionsByCentrelineSummaryPerLocation,
  getCollisionsByCentrelineTotal,
  getLocationByCentreline,
  getLocationsByCentreline,
  getLocationsByCorridor,
  getLocationSuggestions,
  getPoiByCentrelineSummary,
  getReport,
  getReportWeb,
  getStudiesByCentreline,
  getStudiesByCentrelineSummary,
  getStudiesByCentrelineSummaryPerLocation,
  getStudiesByCentrelineTotal,
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
  getCollisionsByCentrelineSummaryPerLocation,
  getCollisionsByCentrelineTotal,
  getLocationByCentreline,
  getLocationsByCentreline,
  getLocationsByCorridor,
  getLocationSuggestions,
  getPoiByCentrelineSummary,
  getReport,
  getReportWeb,
  getStudiesByCentreline,
  getStudiesByCentrelineSummary,
  getStudiesByCentrelineSummaryPerLocation,
  getStudiesByCentrelineTotal,
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
