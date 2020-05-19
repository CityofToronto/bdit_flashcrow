import Boom from '@hapi/boom';

import CollisionDAO from '@/lib/db/CollisionDAO';
import CollisionEvent from '@/lib/model/CollisionEvent';
import CollisionFilters from '@/lib/model/CollisionFilters';
import Joi from '@/lib/model/Joi';
import CentrelineFeature from '@/lib/model/helpers/CentrelineFeature';

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
        ...CentrelineFeature,
        ...CollisionFilters,
      },
    },
  },
  handler: async request => CollisionDAO.byCentreline(request.query),
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
      query: CentrelineFeature,
    },
  },
  handler: async (request) => {
    const { centrelineId, centrelineType } = request.query;
    const total = await CollisionDAO.byCentrelineTotal(centrelineType, centrelineId);
    return { total };
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
        ...CentrelineFeature,
        ...CollisionFilters,
      },
    },
  },
  handler: async request => CollisionDAO.byCentrelineSummary(request.query),
});

export default CollisionController;
