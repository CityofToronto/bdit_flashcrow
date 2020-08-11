import Boom from '@hapi/boom';

import { HttpStatus, ReportFormat } from '@/lib/Constants';
import JobMetadataDAO from '@/lib/db/JobMetadataDAO';
import ReportDAO from '@/lib/db/ReportDAO';
import JobManager from '@/lib/jobs/JobManager';
import JobType from '@/lib/jobs/JobType';
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
 * @name postJobGenerateReports
 * @type {Hapi.ServerRoute}
 */
JobController.push({
  method: 'POST',
  path: '/jobs/GENERATE_REPORTS',
  options: {
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
      const reports = await ReportDAO.byCentreline(features, studyQuery, reportFormat);
      if (reports.length === 0) {
        return Boom.notFound('no reports for given filters');
      }
      const data = { reports };
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
    response: {
      schema: Joi.array().items(JobMetadata.read),
    },
  },
  handler: async (request) => {
    const user = request.auth.credentials;
    return JobMetadataDAO.byUser(user);
  },
});

export default JobController;
