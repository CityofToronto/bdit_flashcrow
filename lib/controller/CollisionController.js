import Boom from '@hapi/boom';

import CollisionDAO from '@/lib/db/CollisionDAO';
import CollisionEvent from '@/lib/model/CollisionEvent';
import CollisionFilters from '@/lib/model/CollisionFilters';
import Joi from '@/lib/model/Joi';
import CentrelineSelection from '@/lib/model/helpers/CentrelineSelection';

/**
 * Routes related to collisions data.
 *
 * @type {Array<Hapi.ServerRoute>}
 */
const CollisionController = [];

/**
 * Fetch map popup details for the given collision.
 *
 * @memberof CollisionController
 * @name getCollisionByCollisionId
 */
CollisionController.push({
  method: 'GET',
  path: '/collisions/{collisionId}',
  options: {
    auth: { mode: 'try' },
    response: {
      schema: CollisionEvent.read,
    },
    validate: {
      params: {
        collisionId: Joi.number().integer().positive().required(),
      },
    },
  },
  handler: async (request) => {
    const { collisionId } = request.params;
    const collision = await CollisionDAO.byCollisionId(collisionId);
    if (collision === null) {
      return Boom.notFound(`no collision found with ID ${collisionId}`);
    }
    return collision;
  },
});

/**
 * Fetch collisions matching the given query.
 *
 * @memberof CollisionController
 * @name getCollisionsByCentreline
 */
CollisionController.push({
  method: 'GET',
  path: '/collisions/byCentreline',
  options: {
    auth: { mode: 'try' },
    response: {
      schema: Joi.array().items(CollisionEvent.read),
    },
    validate: {
      query: {
        ...CentrelineSelection,
        ...CollisionFilters,
      },
    },
  },
  handler: async (request) => {
    const { s1: features, ...collisionQuery } = request.query;
    return CollisionDAO.byCentreline(features, collisionQuery);
  },
});

/**
 * Fetch summary statistics on collisions matching the given query.
 *
 * @memberof CollisionController
 * @name getCollisionsByCentrelineSummary
 */
CollisionController.push({
  method: 'GET',
  path: '/collisions/byCentreline/summary',
  options: {
    auth: { mode: 'try' },
    response: {
      schema: {
        amount: Joi.number().integer().min(0).required(),
        ksi: Joi.number().integer().min(0).required(),
        validated: Joi.number().integer().min(0).required(),
      },
    },
    validate: {
      query: {
        ...CentrelineSelection,
        ...CollisionFilters,
      },
    },
  },
  handler: async (request) => {
    const { s1: features, ...collisionQuery } = request.query;
    return CollisionDAO.byCentrelineSummary(features, collisionQuery);
  },
});

/**
 * Fetch summary statistics on collisions matching the given query, broken down per location.
 *
 * This returns an array, one element per feature in the given `CentrelineSelection`, regardless
 * of whether they have matching collisions, in the same order as they appear in that selection.
 * Since selections can contain duplicate features (e.g. if a selected corridor loops back
 * on itself), the sum of `amount` values in the response may exceed the total as determined using
 * {@link CollisionController.getCollisionsByCentrelineTotal}.
 *
 * If consistency between summary and total stats is desired, you should either pass a
 * `CentrelineSelection` containing unique features here, or post-process the result to only
 * consider summary stats from unique features, or use the total endpoint to retrieve total stats
 * as needed.
 *
 * @memberof CollisionController
 * @name getCollisionsByCentrelineSummaryPerLocation
 */
CollisionController.push({
  method: 'GET',
  path: '/collisions/byCentreline/summaryPerLocation',
  options: {
    auth: { mode: 'try' },
    response: {
      schema: Joi.array().items({
        amount: Joi.number().integer().min(0).required(),
        ksi: Joi.number().integer().min(0).required(),
        validated: Joi.number().integer().min(0).required(),
      }),
    },
    validate: {
      query: {
        ...CentrelineSelection,
        ...CollisionFilters,
      },
    },
  },
  handler: async (request) => {
    const { s1: features, ...collisionQuery } = request.query;
    return CollisionDAO.byCentrelineSummaryPerLocation(features, collisionQuery);
  },
});

/**
 * Fetch total number of collisions at the given centreline feature, regardless of
 * active filters.
 *
 * @memberof CollisionController
 * @name getCollisionsByCentrelineTotal
 */
CollisionController.push({
  method: 'GET',
  path: '/collisions/byCentreline/total',
  options: {
    auth: { mode: 'try' },
    response: {
      schema: {
        total: Joi.number().integer().min(0).required(),
      },
    },
    validate: {
      query: CentrelineSelection,
    },
  },
  handler: async (request) => {
    const { s1: features } = request.query;
    const total = await CollisionDAO.byCentrelineTotal(features);
    return { total };
  },
});

export default CollisionController;
