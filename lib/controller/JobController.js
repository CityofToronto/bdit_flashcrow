import Boom from '@hapi/boom';

import {
  HttpStatus,
  ReportExportMode,
  ReportFormat,
} from '@/lib/Constants';
import JobMetadataDAO from '@/lib/db/JobMetadataDAO';
import ReportDAO from '@/lib/db/ReportDAO';
import CompositeId from '@/lib/io/CompositeId';
import JobManager from '@/lib/jobs/JobManager';
import JobType from '@/lib/jobs/JobType';
import CollisionFilters from '@/lib/model/CollisionFilters';
import JobMetadata from '@/lib/model/JobMetadata';
import Joi from '@/lib/model/Joi';
import StudyFilters from '@/lib/model/StudyFilters';
import CentrelineSelection from '@/lib/model/helpers/CentrelineSelection';

/**
 * Background job-related routes.
 *
 * @type {Array<Hapi.ServerRoute>}
 */
const JobController = [];

/**
 * @memberof JobController
 * @name postJobGenerateCollisionReports
 * @type {Hapi.ServerRoute}
 */
JobController.push({
  method: 'POST',
  path: '/jobs/generateCollisionReports',
  options: {
    auth: {},
    response: {
      schema: JobMetadata.read,
    },
    validate: {
      payload: {
        ...CentrelineSelection,
        ...CollisionFilters,
        reportFormat: Joi.enum().ofType(ReportFormat).required(),
      },
    },
  },
  handler: async (request) => {
    const user = request.auth.credentials;
    const {
      s1: features,
      reportFormat,
      ...collisionQuery
    } = request.payload;
    try {
      const reports = await ReportDAO.byCentrelineAndCollisionQuery(
        features,
        collisionQuery,
        reportFormat,
      );
      if (reports.length === 0) {
        return Boom.notFound('no reports for given filters');
      }
      const s1 = CompositeId.encode(features);
      const data = {
        reportExportMode: ReportExportMode.COLLISIONS,
        reports,
        s1,
      };
      const jobMetadata = await JobManager.publish(JobType.GENERATE_REPORTS, data, user);
      return jobMetadata;
    } catch (err) {
      const { statusCode } = HttpStatus.BAD_REQUEST;
      return Boom.boomify(err, { statusCode, override: false });
    }
  },
});

/**
 * @memberof JobController
 * @name postJobGenerateStudyReports
 * @type {Hapi.ServerRoute}
 */
JobController.push({
  method: 'POST',
  path: '/jobs/generateStudyReports',
  options: {
    auth: {},
    response: {
      schema: JobMetadata.read,
    },
    validate: {
      payload: {
        ...CentrelineSelection,
        ...StudyFilters,
        mostRecent: Joi.number().integer().min(1).default(null),
        reportFormat: Joi.enum().ofType(ReportFormat).required(),
      },
    },
  },
  handler: async (request) => {
    const user = request.auth.credentials;
    const {
      s1: features,
      reportFormat,
      ...studyQuery
    } = request.payload;
    try {
      const reports = await ReportDAO.byCentrelineAndStudyQuery(
        features,
        studyQuery,
        reportFormat,
      );
      if (reports.length === 0) {
        return Boom.notFound('no reports for given filters');
      }
      const s1 = CompositeId.encode(features);
      const data = {
        reportExportMode: ReportExportMode.STUDIES,
        reports,
        s1,
      };
      const jobMetadata = await JobManager.publish(JobType.GENERATE_REPORTS, data, user);
      return jobMetadata;
    } catch (err) {
      const { statusCode } = HttpStatus.BAD_REQUEST;
      return Boom.boomify(err, { statusCode, override: false });
    }
  },
});

/**
 * @memberof JobController
 * @name getJob
 * @type {Hapi.ServerRoute}
 */
JobController.push({
  method: 'GET',
  path: '/jobs/{id}',
  options: {
    auth: {},
    response: {
      schema: JobMetadata.read,
    },
    validate: {
      params: {
        id: Joi.string().uuid().required(),
      },
    },
  },
  handler: async (request) => {
    const { id } = request.params;

    const jobMetadata = await JobMetadataDAO.byJobId(id);
    if (jobMetadata === null) {
      return Boom.notFound(`no job found with ID ${id}`);
    }
    return jobMetadata;
  },
});

/**
 * @memberof JobController
 * @name getJobs
 * @type {Hapi.ServerRoute}
 */
JobController.push({
  method: 'GET',
  path: '/jobs',
  options: {
    auth: {},
    response: {
      schema: Joi.array().items(JobMetadata.read),
    },
  },
  handler: async (request) => {
    const user = request.auth.credentials;
    return JobMetadataDAO.byUser(user);
  },
});

/**
 * @memberof JobController
 * @name putJobCancel
 * @type {Hapi.ServerRoute}
 */
JobController.push({
  method: 'PUT',
  path: '/jobs/{id}/cancel',
  options: {
    auth: {},
    response: {
      schema: JobMetadata.read,
    },
    validate: {
      params: {
        id: Joi.string().uuid().required(),
      },
    },
  },
  handler: async (request) => {
    const { id } = request.params;

    const jobMetadata = await JobMetadataDAO.byJobId(id);
    if (jobMetadata === null) {
      return Boom.notFound(`no job found with ID ${id}`);
    }
    const { state } = jobMetadata;
    if (state !== 'created' && state !== 'active') {
      return Boom.badRequest(`cannot cancel job ${id}: state is ${state}`);
    }

    return JobManager.cancel(jobMetadata);
  },
});

export default JobController;
