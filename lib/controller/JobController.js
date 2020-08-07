import Boom from '@hapi/boom';

import { HttpStatus } from '@/lib/Constants';
import JobDAO from '@/lib/db/JobDAO';
import JobManager from '@/lib/jobs/JobManager';
import JobType from '@/lib/jobs/JobType';
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
      const job = await JobManager.publish(jobType, data, user);
      return job;
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
    validate: {
      params: {
        id: Joi.string().uuid().required(),
      },
    },
  },
  handler: async (request) => {
    const { id } = request.params;

    const job = await JobDAO.byId(id);
    if (job === null) {
      return Boom.notFound(`no job found with ID ${id}`);
    }
    return job;
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
  handler: async (request) => {
    const user = request.auth.credentials;
    return JobDAO.byUser(user);
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
  handler: async (/* request */) => {
    // TODO: implement this
  },
});

export default JobController;
