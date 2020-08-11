import Boom from '@hapi/boom';

import { HttpStatus } from '@/lib/Constants';
import JobMetadataDAO from '@/lib/db/JobMetadataDAO';
import JobManager from '@/lib/jobs/JobManager';
import JobType from '@/lib/jobs/JobType';
import JobMetadata from '@/lib/model/JobMetadata';
import Joi from '@/lib/model/Joi';

/**
 * Background job-related routes.
 *
 * @type {Array<Hapi.ServerRoute>}
 */
const JobController = [];

/**
 * @memberof JobController
 * @name postJob
 * @type {Hapi.ServerRoute}
 */
JobController.push({
  method: 'POST',
  path: '/jobs',
  options: {
    response: {
      schema: JobMetadata.read,
    },
    validate: {
      payload: {
        type: Joi.enum().ofType(JobType).required(),
        data: Joi.object().unknown(),
      },
    },
  },
  handler: async (request) => {
    const user = request.auth.credentials;
    const { type: jobType, data } = request.payload;
    try {
      const jobMetadata = await JobManager.publish(jobType, data, user);
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
