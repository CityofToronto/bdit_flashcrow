import ArrayUtils from '@/lib/ArrayUtils';
import {
  centrelineKey,
  POI_RADIUS,
  ReportBlock,
  ReportFormat,
  ReportType,
  StudyType,
  AuthScope,
} from '@/lib/Constants';
import { mapBy } from '@/lib/MapUtils';
import AxiosBackendClient from '@/lib/api/AxiosBackendClient';
import CompositeId from '@/lib/io/CompositeId';
import AuthState from '@/lib/model/AuthState';
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

async function deleteStudyRequestBulkRequests(csrf, studyRequests) {
  const studyRequestIds = studyRequests.map(({ id }) => id);
  const options = {
    method: 'DELETE',
    csrf,
    data: { studyRequestIds },
  };
  return apiClient.fetch('/requests/study/bulk/requests', options);
}

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

async function getCollisionFactors() {
  let collisionFactors = await apiClient.fetch('/collisions/factors');

  const collisionFactorsSchema = Joi.array().items(
    Joi.array().ordered(
      Joi.string().required(),
      Joi.array().items(
        Joi.array().ordered(
          Joi.number().integer().min(0).required(),
          Joi.object().keys({
            code: Joi.string().allow(null).required(),
            description: Joi.string().required(),
          }),
        ),
      ),
    ),
  );
  collisionFactors = await collisionFactorsSchema.validateAsync(collisionFactors);

  return new Map(
    collisionFactors.map(
      ([field, fieldEntries]) => [field, new Map(fieldEntries)],
    ),
  );
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
  const locationsSchema = Joi.array().items(
    Joi.object().keys(CentrelineLocation).allow(null),
  );
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

function getReportOptions(type, id, format, reportParameters) {
  const responseType = format.mimeType === 'application/json' ? 'json' : 'blob';
  return {
    method: 'GET',
    data: {
      type,
      id,
      format,
      singleFile: true,
      ...reportParameters,
    },
    responseType,
  };
}

async function getReport(type, id, format, reportParameters) {
  const options = getReportOptions(type, id, format, reportParameters);
  return reporterClient.fetch('/reports', options);
}

function getReportDownload(type, id, format, reportParameters) {
  const options = getReportOptions(type, id, format, reportParameters);
  reporterClient.download('/reports', options);
}

async function getReportWeb(type, id, reportParameters) {
  const {
    content,
    generatedAt,
    header,
    type: reportTypeStr,
  } = await getReport(type, id, ReportFormat.WEB, reportParameters);

  const reportGeneratedAt = DateTime.fromJSON(generatedAt);
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
    content: reportContent,
    generatedAt: reportGeneratedAt,
    header,
    type: reportType,
  };
}

async function getStorage(namespace, key) {
  const options = {
    method: 'GET',
    responseType: 'blob',
  };
  return apiClient.fetch(`/storage/${namespace}/${key}`, options);
}

async function getMvcr(collisionYear, collisionMonth, collisionId) {
  const options = {
    method: 'GET',
    responseType: 'blob',
  };
  return apiClient.fetch(`/mvcr/${collisionYear}/${collisionMonth}/${collisionId}`, options);
}

async function downloadBulkMvcr(filename) {
  const options = {
    method: 'GET',
    responseType: 'blob',
  };
  return apiClient.download(`/bulk-mvcr/${filename}`, options);
}

async function hasMvcr(collisionYear, collisionMonth, collisionId) {
  const options = {
    method: 'GET',
    responseType: 'json',
  };
  return apiClient.fetch(`/has-mvcr/${collisionYear}/${collisionMonth}/${collisionId}`, options);
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
      mostRecent: Study.read,
      n: Joi.number().integer().positive().required(),
      studyType: Joi.enum().ofType(StudyType).required(),
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
      perLocation: Joi.array().items(
        Joi.object().keys({
          mostRecent: Study.read.allow(null),
          n: Joi.number().integer().min(0).required(),
        }),
      ),
      studyType: Joi.enum().ofType(StudyType).required(),
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

  const promiseUsers = getUsersByIds(userIds);
  const featureChunks = ArrayUtils.chunk(features, CompositeId.MAX_FEATURES);
  const promisesLocationChunks = featureChunks.map(getLocationsByCentreline);
  const [
    studyRequestUsers,
    ...studyRequestLocationChunks
  ] = await Promise.all([promiseUsers, ...promisesLocationChunks]);
  const studyRequestLocations = studyRequestLocationChunks
    .flat()
    .filter(location => location !== null);
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
  let studyRequestLocation = null;
  if (studyRequestLocations.has(key)) {
    studyRequestLocation = studyRequestLocations.get(key);
  }
  return {
    studyRequest,
    studyRequestChanges,
    studyRequestComments,
    studyRequestLocation,
    studyRequestUsers,
  };
}

async function getStudyRequestBulk(id) {
  let [
    studyRequestBulk,
    studyRequestChanges,
  ] = await Promise.all([
    apiClient.fetch(`/requests/study/bulk/${id}`),
    apiClient.fetch(`/requests/study/bulk/${id}/changes`),
  ]);

  studyRequestBulk = await StudyRequestBulk.read.validateAsync(studyRequestBulk);

  const studyRequestChangesSchema = Joi.array().items(StudyRequestChange.read);
  studyRequestChanges = await studyRequestChangesSchema.validateAsync(studyRequestChanges);

  const metadata = await fetchStudyRequestsMetadata(studyRequestBulk.studyRequests, []);
  return {
    studyRequestBulk,
    studyRequestChanges,
    ...metadata,
  };
}

async function getStudyRequestBulkName(id) {
  const response = await apiClient.fetch(`/requests/study/bulk/${id}/name`);
  return response.name;
}

async function getStudyRequestsBulkSuggest(query) {
  if (query.length < 3) {
    return [];
  }
  const options = {
    data: {
      limit: 10,
      q: query,
    },
  };
  const studyRequestsBulk = await apiClient.fetch('/requests/study/bulk/suggest', options);
  const studyRequestsBulkSchema = Joi.array().items(StudyRequestBulk.read);
  return studyRequestsBulkSchema.validateAsync(studyRequestsBulk);
}

async function getStudyRequestsByCentrelinePending(features) {
  const s1 = CompositeId.encode(features);
  const data = { s1 };
  const options = { data };
  const studyRequests = await apiClient.fetch('/requests/study/byCentreline/pending', options);
  const studyRequestsSchema = Joi.array().items(StudyRequest.read);
  return studyRequestsSchema.validateAsync(studyRequests);
}

async function getStudyRequestItems(filters) {
  const options = { data: filters };
  let studyRequestItems = await apiClient.fetch('/requests/study/items', options);

  const studyRequestItemsSchema = Joi.array().items(
    Joi.object().keys({
      bulk: Joi.boolean().required(),
      request: Joi.when(
        'bulk',
        {
          is: true,
          then: StudyRequestBulk.read.required(),
          otherwise: StudyRequest.read.required(),
        },
      ),
    }),
  );
  studyRequestItems = await studyRequestItemsSchema.validateAsync(studyRequestItems);

  const studyRequestsAll = [];
  studyRequestItems.forEach(({ bulk, request }) => {
    if (bulk) {
      studyRequestsAll.push(...request.studyRequests);
    } else {
      studyRequestsAll.push(request);
    }
  });
  const metadata = await fetchStudyRequestsMetadata(studyRequestsAll, []);

  return {
    studyRequestItems,
    ...metadata,
  };
}

async function getStudyRequestItemsTotal(filters) {
  const options = { data: filters };
  const { total } = await apiClient.fetch('/requests/study/items/total', options);
  return total;
}

async function getUsers() {
  const users = await apiClient.fetch('/users');
  const usersSchema = Joi.array().items(User.read);
  return usersSchema.validateAsync(users);
}

async function getUsersPagination(limit, offset, search) {
  const url = `/users?limit=${limit}&offset=${offset}&search=${search}`;
  const users = await apiClient.fetch(url);
  const usersSchema = Joi.array().items(User.read);
  return usersSchema.validateAsync(users);
}

async function getUsersTotal(search) {
  const url = `/users/total?search=${search}`;
  const { total } = await apiClient.fetch(url);
  return total;
}

async function postJobGenerateCollisionReports(csrf, locationsSelection, filters, reportFormat) {
  const { locations, selectionType } = locationsSelection;
  const s1 = CompositeId.encode(locations);
  const data = {
    s1,
    selectionType,
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

async function postJobCompressMvcrs(csrf, mvcrIds, location) {
  const options = {
    method: 'POST',
    csrf,
    data: JSON.stringify({
      mvcrIds,
      location,
    }),
  };
  const jobMetaData = await schedulerClient.fetch('/jobs/compressMvcrs', options);
  return normalizeJobMetadata(jobMetaData);
}

async function postJobGenerateStudyReports(csrf, locationsSelection, filters, reportFormat) {
  const { locations, selectionType } = locationsSelection;
  const s1 = CompositeId.encode(locations);
  const data = {
    s1,
    selectionType,
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

async function postStudyRequestBulkFromRequests(csrf, studyRequestBulk, studyRequests) {
  const studyRequestIds = studyRequests.map(({ id }) => id);
  const options = {
    method: 'POST',
    csrf,
    data: {
      studyRequestBulk,
      studyRequestIds,
    },
  };
  const persistedStudyRequestBulk = await apiClient.fetch('/requests/study/bulk/fromRequests', options);
  return StudyRequestBulk.read.validateAsync(persistedStudyRequestBulk);
}

async function postStudyRequestBulkRequests(csrf, studyRequestBulk, studyRequests) {
  const { id: studyRequestBulkId } = studyRequestBulk;
  const url = `/requests/study/bulk/${studyRequestBulkId}/requests`;
  const options = {
    method: 'POST',
    csrf,
    data: { studyRequests },
  };
  const persistedStudyRequestBulk = await apiClient.fetch(url, options);
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

async function putStudyRequest(csrf, studyRequest) {
  const { id: studyRequestId } = studyRequest;
  const url = `/requests/study/${studyRequestId}`;
  const options = {
    method: 'PUT',
    csrf,
    data: studyRequest,
  };
  const studyRequestUpdated = await apiClient.fetch(url, options);
  return StudyRequest.read.validateAsync(studyRequestUpdated);
}

async function putStudyRequestBulk(csrf, studyRequestBulk) {
  const { id: studyRequestBulkId } = studyRequestBulk;
  const url = `/requests/study/bulk/${studyRequestBulkId}`;
  const options = {
    method: 'PUT',
    csrf,
    data: studyRequestBulk,
  };
  const studyRequestBulkUpdated = await apiClient.fetch(url, options);
  return StudyRequestBulk.read.validateAsync(studyRequestBulkUpdated);
}

async function putStudyRequestBulkRequests(csrf, studyRequestBulk, studyRequests) {
  const { id: studyRequestBulkId } = studyRequestBulk;
  const studyRequestIds = studyRequests.map(({ id }) => id);
  const url = `/requests/study/bulk/${studyRequestBulkId}/requests`;
  const options = {
    method: 'PUT',
    csrf,
    data: { studyRequestIds },
  };
  const studyRequestBulkUpdated = await apiClient.fetch(url, options);
  return StudyRequestBulk.read.validateAsync(studyRequestBulkUpdated);
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

async function putStudyRequestItems(csrf) {
  const url = '/requests/study/items';
  const options = {
    method: 'PUT',
    csrf,
  };
  const response = await apiClient.fetch(url, options);
  return response;
}

async function putUser(auth, newUserData) {
  const { csrf } = auth;
  const { id: userId } = newUserData;
  const currentUserMap = await getUsersByIds([userId]);
  const url = `/users/${userId}`;
  let updatedUserData = newUserData;
  const currentUserData = currentUserMap.entries().next().value[1];
  if (currentUserData.mvcrAcctType !== newUserData.mvcrAcctType) {
    const deltas = {};
    const authScope = newUserData.scope;
    if (newUserData.mvcrAcctType === 0) {
      deltas.scope = authScope.filter(scopeItem => scopeItem !== AuthScope.MVCR_READ);
      deltas.mvcrExpiryDate = null;
    } else if (newUserData.mvcrAcctType === 1) {
      if (!currentUserData.scope.includes(AuthScope.MVCR_READ)) {
        deltas.scope = [...authScope, AuthScope.MVCR_READ];
      }
      // deltas.mvcrExpiryDate = DateTime.local().plus({ weeks: 1 });
      deltas.mvcrExpiryDate = DateTime.local().plus({ minutes: 5 });
    } else if (newUserData.mvcrAcctType === 2) {
      if (!currentUserData.scope.includes(AuthScope.MVCR_READ)) {
        deltas.scope = [...authScope, AuthScope.MVCR_READ];
      }
      deltas.mvcrExpiryDate = null;
    }
    updatedUserData = { ...newUserData, ...deltas };
  }
  const options = {
    method: 'PUT',
    csrf,
    data: updatedUserData,
  };
  const persistedUser = await apiClient.fetch(url, options);
  return User.read.validateAsync(persistedUser);
}

const WebApi = {
  deleteStudyRequestBulkRequests,
  deleteStudyRequestComment,
  getAuth,
  getCollisionByCollisionId,
  getCollisionFactors,
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
  getReportDownload,
  getReportWeb,
  getMvcr,
  downloadBulkMvcr,
  hasMvcr,
  getStorage,
  getStudiesByCentreline,
  getStudiesByCentrelineSummary,
  getStudiesByCentrelineSummaryPerLocation,
  getStudiesByCentrelineTotal,
  getStudyRequest,
  getStudyRequestBulk,
  getStudyRequestBulkName,
  getStudyRequestsBulkSuggest,
  getStudyRequestsByCentrelinePending,
  getStudyRequestItems,
  getStudyRequestItemsTotal,
  getUsers,
  getUsersPagination,
  getUsersTotal,
  getUsersByIds,
  postJobGenerateCollisionReports,
  postJobCompressMvcrs,
  postJobGenerateStudyReports,
  postStudyRequest,
  postStudyRequestBulk,
  postStudyRequestBulkFromRequests,
  postStudyRequestBulkRequests,
  postStudyRequestComment,
  putJobCancel,
  putStudyRequest,
  putStudyRequestBulk,
  putStudyRequestBulkRequests,
  putStudyRequestComment,
  putStudyRequestItems,
  putUser,
};

export {
  WebApi as default,
  deleteStudyRequestBulkRequests,
  deleteStudyRequestComment,
  getAuth,
  getCollisionByCollisionId,
  getCollisionFactors,
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
  getReportDownload,
  getReportWeb,
  getMvcr,
  downloadBulkMvcr,
  hasMvcr,
  getStorage,
  getStudiesByCentreline,
  getStudiesByCentrelineSummary,
  getStudiesByCentrelineSummaryPerLocation,
  getStudiesByCentrelineTotal,
  getStudyRequest,
  getStudyRequestBulk,
  getStudyRequestBulkName,
  getStudyRequestsBulkSuggest,
  getStudyRequestsByCentrelinePending,
  getStudyRequestItems,
  getStudyRequestItemsTotal,
  getUsers,
  getUsersByIds,
  getUsersPagination,
  getUsersTotal,
  postJobGenerateCollisionReports,
  postJobCompressMvcrs,
  postJobGenerateStudyReports,
  postStudyRequest,
  postStudyRequestBulk,
  postStudyRequestBulkFromRequests,
  postStudyRequestBulkRequests,
  postStudyRequestComment,
  putJobCancel,
  putStudyRequest,
  putStudyRequestBulk,
  putStudyRequestBulkRequests,
  putStudyRequestComment,
  putStudyRequestItems,
  putUser,
};
