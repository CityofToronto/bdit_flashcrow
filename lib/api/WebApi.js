import {
  centrelineKey,
  POI_RADIUS,
  ReportBlock,
  ReportFormat,
  ReportType,
} from '@/lib/Constants';
import { mapBy } from '@/lib/MapUtils';
import AxiosBackendClient from '@/lib/api/AxiosBackendClient';
import CompositeId from '@/lib/io/CompositeId';
import AuthState from '@/lib/model/AuthState';
import Category from '@/lib/model/Category';
import CollisionEvent from '@/lib/model/CollisionEvent';
import Joi from '@/lib/model/Joi';
import Study from '@/lib/model/Study';
import StudyRequest from '@/lib/model/StudyRequest';
import StudyRequestBulk from '@/lib/model/StudyRequestBulk';
import StudyRequestChange from '@/lib/model/StudyRequestChange';
import StudyRequestComment from '@/lib/model/StudyRequestComment';
import SuccessResponse from '@/lib/model/SuccessResponse';
import User from '@/lib/model/User';
import CentrelineLocation from '@/lib/model/helpers/CentrelineLocation';
import {
  normalizeJobMetadata,
  normalizeJobMetadatas,
} from '@/lib/model/helpers/NormalizeUtils';
import DateTime from '@/lib/time/DateTime';

const apiClient = new AxiosBackendClient('/api');
const reporterClient = new AxiosBackendClient('/reporter');
const schedulerClient = new AxiosBackendClient('/scheduler');

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

async function getJob(jobId) {
  const jobMetadata = await schedulerClient.fetch(`/jobs/${jobId}`);
  return normalizeJobMetadata(jobMetadata);
}

async function getJobs() {
  const jobMetadatas = await schedulerClient.fetch('/jobs');
  return normalizeJobMetadatas(jobMetadatas);
}

async function getJobsExistsNew() {
  const response = await schedulerClient.fetch('/jobs/existsNew');
  return response.existsNew;
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

async function getStorage(namespace, key) {
  const options = {
    method: 'GET',
    responseType: 'blob',
  };
  return apiClient.fetch(`/storage/${namespace}/${key}`, options);
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

async function fetchStudyRequestsMetadata(studyRequests, studyRequestComments) {
  const centrelineKeys = new Set();
  const features = [];
  let userIds = new Set();
  studyRequests.forEach(({ centrelineId, centrelineType, userId }) => {
    const feature = { centrelineId, centrelineType };
    const key = centrelineKey(feature);
    if (!centrelineKeys.has(key)) {
      centrelineKeys.add(key);
      features.push(feature);
    }
    userIds.add(userId);
  });
  studyRequestComments.forEach(({ userId }) => {
    userIds.add(userId);
  });
  userIds = Array.from(userIds);

  const promiseLocations = getLocationsByCentreline(features);
  const promiseUsers = getUsersByIds(userIds);
  const [
    studyRequestLocations,
    studyRequestUsers,
  ] = await Promise.all([promiseLocations, promiseUsers]);
  const studyRequestLocationsMap = mapBy(studyRequestLocations, centrelineKey);

  return {
    studyRequestLocations: studyRequestLocationsMap,
    studyRequestUsers,
  };
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
    studyRequestLocations,
    studyRequestUsers,
  } = await fetchStudyRequestsMetadata([studyRequest], studyRequestComments);
  const key = centrelineKey(studyRequest);
  const studyRequestLocation = studyRequestLocations.get(key);
  return {
    studyRequest,
    studyRequestChanges,
    studyRequestComments,
    studyRequestLocation,
    studyRequestUsers,
  };
}

async function getStudyRequestBulk(id) {
  let studyRequestBulk = await apiClient.fetch(`/requests/study/bulk/${id}`);
  studyRequestBulk = await StudyRequestBulk.read.validateAsync(studyRequestBulk);

  const metadata = await fetchStudyRequestsMetadata(studyRequestBulk.studyRequests, []);
  return {
    studyRequestBulk,
    ...metadata,
  };
}

async function getStudyRequestBulkName(id) {
  const response = await apiClient.fetch(`/requests/study/bulk/${id}/name`);
  return response.name;
}

async function getStudyRequests() {
  let {
    studyRequests,
    studyRequestsBulk,
  } = await apiClient.fetch('/requests/study');

  const studyRequestsSchema = Joi.array().items(StudyRequest.read);
  studyRequests = await studyRequestsSchema.validateAsync(studyRequests);

  const studyRequestsBulkSchema = Joi.array().items(StudyRequestBulk.read);
  studyRequestsBulk = await studyRequestsBulkSchema.validateAsync(studyRequestsBulk);

  let studyRequestsAll = [
    studyRequests,
    ...studyRequestsBulk.map(studyRequestBulk => studyRequestBulk.studyRequests),
  ];
  studyRequestsAll = Array.prototype.concat.apply([], studyRequestsAll);
  const metadata = await fetchStudyRequestsMetadata(studyRequestsAll, []);

  return {
    studyRequests,
    studyRequestsBulk,
    ...metadata,
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

async function getStudyRequestsBulkByLocationsSelectionPending(locationsSelection) {
  const { locations, selectionType } = locationsSelection;
  const s1 = CompositeId.encode(locations);
  const data = { s1, selectionType };
  const options = { data };
  const studyRequestsBulk = await apiClient.fetch(
    '/requests/study/bulk/byLocationsSelection/pending',
    options,
  );
  const studyRequestsBulkSchema = Joi.array().items(StudyRequestBulk.read);
  return studyRequestsBulkSchema.validateAsync(studyRequestsBulk);
}

async function getUsers() {
  const users = await apiClient.fetch('/users');
  const usersSchema = Joi.array().items(User.read);
  return usersSchema.validateAsync(users);
}

async function postJobGenerateCollisionReports(csrf, features, filters, reportFormat) {
  const s1 = CompositeId.encode(features);
  const data = {
    s1,
    ...filters,
    reportFormat,
  };
  const options = {
    method: 'POST',
    csrf,
    data,
  };
  const jobMetadata = await schedulerClient.fetch('/jobs/generateCollisionReports', options);
  return normalizeJobMetadata(jobMetadata);
}

async function postJobGenerateStudyReports(csrf, features, filters, reportFormat) {
  const s1 = CompositeId.encode(features);
  const data = {
    s1,
    ...filters,
    reportFormat,
  };
  const options = {
    method: 'POST',
    csrf,
    data,
  };
  const jobMetadata = await schedulerClient.fetch('/jobs/generateStudyReports', options);
  return normalizeJobMetadata(jobMetadata);
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

async function postStudyRequestBulk(csrf, studyRequestBulk) {
  const options = {
    method: 'POST',
    csrf,
    data: studyRequestBulk,
  };
  const persistedStudyRequestBulk = await apiClient.fetch('/requests/study/bulk', options);
  return StudyRequestBulk.read.validateAsync(persistedStudyRequestBulk);
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

async function putJobCancel(csrf, jobMetadata) {
  const { jobId } = jobMetadata;
  const url = `/jobs/${jobId}/cancel`;
  const options = {
    method: 'PUT',
    csrf,
  };
  const persistedJobMetadata = await schedulerClient.fetch(url, options);
  return normalizeJobMetadata(persistedJobMetadata);
}

async function putJobDismiss(csrf, jobMetadata) {
  const { jobId } = jobMetadata;
  const url = `/jobs/${jobId}/dismiss`;
  const options = {
    method: 'PUT',
    csrf,
  };
  const persistedJobMetadata = await schedulerClient.fetch(url, options);
  return normalizeJobMetadata(persistedJobMetadata);
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

async function putStudyRequestBulk(csrf, studyRequestBulk) {
  const { id: studyRequestBulkId } = studyRequestBulk;
  // TODO: this endpoint doesn't exist yet!
  const url = `/requests/study/bulk/${studyRequestBulkId}`;
  const options = {
    method: 'PUT',
    csrf,
    data: studyRequestBulk,
  };
  const response = await apiClient.fetch(url, options);
  return StudyRequestBulk.read.validateAsync(response);
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
  getJob,
  getJobs,
  getJobsExistsNew,
  getLocationByCentreline,
  getLocationsByCentreline,
  getLocationsByCorridor,
  getLocationSuggestions,
  getPoiByCentrelineSummary,
  getReport,
  getReportWeb,
  getStorage,
  getStudiesByCentreline,
  getStudiesByCentrelineSummary,
  getStudiesByCentrelineSummaryPerLocation,
  getStudiesByCentrelineTotal,
  getStudyRequest,
  getStudyRequestBulk,
  getStudyRequestBulkName,
  getStudyRequests,
  getStudyRequestsByCentrelinePending,
  getStudyRequestsBulkByLocationsSelectionPending,
  getUsers,
  getUsersByIds,
  postJobGenerateCollisionReports,
  postJobGenerateStudyReports,
  postStudyRequest,
  postStudyRequestBulk,
  postStudyRequestComment,
  putJobCancel,
  putJobDismiss,
  putStudyRequest,
  putStudyRequestBulk,
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
  getJob,
  getJobs,
  getJobsExistsNew,
  getLocationByCentreline,
  getLocationsByCentreline,
  getLocationsByCorridor,
  getLocationSuggestions,
  getPoiByCentrelineSummary,
  getReport,
  getReportWeb,
  getStorage,
  getStudiesByCentreline,
  getStudiesByCentrelineSummary,
  getStudiesByCentrelineSummaryPerLocation,
  getStudiesByCentrelineTotal,
  getStudyRequest,
  getStudyRequestBulk,
  getStudyRequestBulkName,
  getStudyRequests,
  getStudyRequestsByCentrelinePending,
  getStudyRequestsBulkByLocationsSelectionPending,
  getUsers,
  getUsersByIds,
  postJobGenerateCollisionReports,
  postJobGenerateStudyReports,
  postStudyRequest,
  postStudyRequestBulk,
  postStudyRequestComment,
  putJobCancel,
  putJobDismiss,
  putStudyRequest,
  putStudyRequestBulk,
  putStudyRequestComment,
  putUser,
};
