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
  handler: async (/* request */) => {
    // TODO: implement this
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
  handler: async (/* request */) => {
    // TODO: implement this
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
