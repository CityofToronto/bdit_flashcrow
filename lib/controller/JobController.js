import Boom from '@hapi/boom';

import {
  HttpStatus,
  LocationSelectionType,
  MAX_LOCATIONS,
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
 * Background job-related routes.  Note that routes in this controller are handled by
 * `scheduler`.  These routes largely handle "job metadata records", which provide
 * callers with information on the status and progress of jobs.
 *
 * `pg-boss` handles the actual execution and database storage of background jobs, with
 * MOVE's {@link JobManager} as an application-specific wrapper around that.
 *
 * @type {Array<Hapi.ServerRoute>}
 */
const JobController = [];

/**
 * Start a new background job for bulk generation of collision reports.  This job
 * generates collision tabulation and directory reports covering all collisions
 * matching the given collision query.
 *
 * Returns job metadata for the new job.
 *
 * @memberof JobController
 * @name postJobGenerateCollisionReports
 * @type {Hapi.ServerRoute}
 */
JobController.push({
  method: 'POST',
  path: '/jobs/generateCollisionReports',
  options: {
    auth: {},
    description: 'Start a new background job for bulk generation of collision reports',
    response: {
      schema: JobMetadata.read,
    },
    tags: ['api'],
    validate: {
      payload: {
        ...CentrelineSelection,
        ...CollisionFilters,
        reportFormat: Joi.enum().ofType(ReportFormat).required(),
        selectionType: Joi.enum().ofType(LocationSelectionType).required(),
      },
    },
  },
  handler: async (request) => {
    const user = request.auth.credentials;
    const {
      s1,
      selectionType,
      reportFormat,
      ...collisionQuery
    } = request.payload;

    try {
      const features = CompositeId.decode(s1);
      if (features.length > MAX_LOCATIONS) {
        return Boom.badRequest(`cannot fetch reports on more than ${MAX_LOCATIONS} locations`);
      }
      const featuresSelection = { features, selectionType };

      const reports = await ReportDAO.byCentrelineAndCollisionQuery(
        featuresSelection,
        collisionQuery,
        reportFormat,
      );
      if (reports.length === 0) {
        return Boom.notFound('no reports for given filters');
      }
      const data = {
        reportExportMode: ReportExportMode.COLLISIONS,
        reports,
        s1,
        selectionType,
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
 * Start a new background job for bulk generation of traffic study reports.  This job
 * generates reports of all appropriate types for all traffic studies matching the given
 * traffic study query.
 *
 * Returns job metadata for the new job.
 *
 * @memberof JobController
 * @name postJobGenerateStudyReports
 * @type {Hapi.ServerRoute}
 */
JobController.push({
  method: 'POST',
  path: '/jobs/generateStudyReports',
  options: {
    auth: {},
    description: 'Start a new background job for bulk generation of study reports',
    response: {
      schema: JobMetadata.read,
    },
    tags: ['api'],
    validate: {
      payload: {
        ...CentrelineSelection,
        ...StudyFilters,
        mostRecent: Joi.number().integer().min(1).default(null),
        reportFormat: Joi.enum().ofType(ReportFormat).required(),
        selectionType: Joi.enum().ofType(LocationSelectionType).required(),
      },
    },
  },
  handler: async (request) => {
    const user = request.auth.credentials;
    const {
      s1,
      selectionType,
      reportFormat,
      ...studyQuery
    } = request.payload;

    try {
      const features = CompositeId.decode(s1);
      if (features.length > MAX_LOCATIONS) {
        return Boom.badRequest(`cannot fetch reports on more than ${MAX_LOCATIONS} locations`);
      }
      const featuresSelection = { features, selectionType };

      const reports = await ReportDAO.byCentrelineAndStudyQuery(
        featuresSelection,
        studyQuery,
        reportFormat,
      );
      if (reports.length === 0) {
        return Boom.notFound('no reports for given filters');
      }
      const data = {
        reportExportMode: ReportExportMode.STUDIES,
        reports,
        s1,
        selectionType,
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
 * Fetch job status and progress information for the background job with the given ID.
 *
 * This can be polled to monitor job status over time.
 *
 * @memberof JobController
 * @name getJob
 * @type {Hapi.ServerRoute}
 */
JobController.push({
  method: 'GET',
  path: '/jobs/{id}',
  options: {
    auth: {},
    description: 'Fetch status and progress information for the given background job',
    response: {
      schema: JobMetadata.read,
    },
    tags: ['api'],
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
 * Returns all background jobs previously submitted by the authenticated user.
 *
 * Currently this does not paginate results, but it may do so in the future.
 *
 * @memberof JobController
 * @name getJobs
 * @type {Hapi.ServerRoute}
 */
JobController.push({
  method: 'GET',
  path: '/jobs',
  options: {
    auth: {},
    description: 'Get all background jobs submitted by the active user',
    response: {
      schema: Joi.array().items(JobMetadata.read),
    },
    tags: ['api'],
  },
  handler: async (request) => {
    const user = request.auth.credentials;
    return JobMetadataDAO.byUser(user);
  },
});

/**
 * Returns a boolean value `existsNew`, which indicates whether the user has jobs that have
 * not been "dismissed" (i.e. in the notification sense).  This typically means that a job
 * has newly completed (either successfully or not).
 *
 * This does not return full job information; use {@link JobController.getJobs} if you need
 * full job details.
 *
 * @memberof JobController
 * @name getJobsExistsNew
 * @type {Hapi.ServerRoute}
 */
JobController.push({
  method: 'GET',
  path: '/jobs/existsNew',
  options: {
    auth: {},
    description: 'Determine if the active user has any undismissed jobs',
    response: {
      schema: {
        existsNew: Joi.boolean().required(),
      },
    },
  },
  handler: async (request) => {
    const user = request.auth.credentials;
    const existsNew = await JobMetadataDAO.byUserExistsNew(user);
    return { existsNew };
  },
});

/**
 * Cancels the background job with the given ID.  Note that the job may not stop immediately;
 * it is up to `pg-boss`, and to implementations of individual job types, to decide when
 * a job can gracefully be stopped.
 *
 * Returns job metadata for the cancelled job.
 *
 * HTTP 400 if the job is not in `created` or `active` state; other states indicate that
 * the job has completed (either successfully or not), at which point it cannot be cancelled.
 *
 * @memberof JobController
 * @name putJobCancel
 * @type {Hapi.ServerRoute}
 */
JobController.push({
  method: 'PUT',
  path: '/jobs/{id}/cancel',
  options: {
    auth: {},
    description: 'Cancel the given background job',
    response: {
      schema: JobMetadata.read,
    },
    tags: ['api'],
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

/**
 * Marks the given job as dismissed (in the sense described in
 * {@link JobController.getJobsExistsNew}).
 *
 * Returns job metadata for the newly dismissed job.
 *
 * @memberof JobController
 * @name putJobDismiss
 * @type {Hapi.ServerRoute}
 */
JobController.push({
  method: 'PUT',
  path: '/jobs/{id}/dismiss',
  options: {
    auth: {},
    description: 'Dismiss the given background job',
    response: {
      schema: JobMetadata.read,
    },
    tags: ['api'],
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
    if (state === 'created' || state === 'active') {
      return Boom.badRequest(`cannot dismiss job ${id}: still in progress`);
    }

    jobMetadata.dismissed = true;
    return JobMetadataDAO.update(jobMetadata);
  },
});

export default JobController;
