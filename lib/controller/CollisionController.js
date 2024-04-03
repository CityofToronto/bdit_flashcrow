import Boom from '@hapi/boom';
import {
  HttpStatus,
} from '@/lib/Constants';
import CollisionDAO from '@/lib/db/CollisionDAO';
import CollisionFactorDAO from '@/lib/db/CollisionFactorDAO';
import CompositeId from '@/lib/io/CompositeId';
import CollisionEvent from '@/lib/model/CollisionEvent';
import CollisionFilters from '@/lib/model/CollisionFilters';
import Joi from '@/lib/model/Joi';
import CentrelineSelection from '@/lib/model/helpers/CentrelineSelection';

/**
 * Routes related to collisions data.
 *
 * MOVE does not currently provide access to sensitive details of collision records, so for
 * now these routes do not require authentication.
 *
 * @type {Array<Hapi.ServerRoute>}
 */
const CollisionController = [];

/**
 * Fetch the entire `collision_factors` mapping of fields, their possible values, and
 * human-readable descriptions for those values.
 *
 * Returns an array-based representation of said mapping; you can rebuild the original `Map`
 * by iterating over the result and using the `Map` constructor.
 *
 * @memberof CollisionController
 * @name getCollisionFactors
 */
CollisionController.push({
  method: 'GET',
  path: '/collisions/factors',
  options: {
    auth: { mode: 'try' },
    description: 'Get information about possible codes for various MVCR fields',
    response: {
      schema: Joi.array().items(
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
      ),
    },
    tags: ['api'],
  },
  handler: async () => {
    let collisionFactors = null;
    try {
      collisionFactors = await CollisionFactorDAO.all();
    } catch (err) {
      const { statusCode } = HttpStatus.INTERNAL_SERVER_ERROR;
      return Boom.boomify(err, { statusCode, override: false, message: 'unable to retrieve collision factors' });
    }
    return Array.from(collisionFactors)
      .map(([field, fieldEntries]) => [field, Array.from(fieldEntries)]);
  },
});

/**
 * Fetch details for the collision with the given `collision_id`.  These details include both
 * information about the collision as a whole (e.g. location, road conditions) and anonymized,
 * non-sensitive information about persons and vehicles involved in the collision (e.g.
 * location of impact, severity of injury if any).
 *
 * @memberof CollisionController
 * @name getCollisionByCollisionId
 */
CollisionController.push({
  method: 'GET',
  path: '/collisions/{collisionId}',
  options: {
    auth: { mode: 'try' },
    description: 'Get the collision with the given ID',
    response: {
      schema: CollisionEvent.read,
    },
    tags: ['api'],
    validate: {
      params: {
        collisionId: Joi.string().required(),
      },
    },
  },
  handler: async (request) => {
    const { collisionId } = request.params;
    let collision = null;
    try {
      collision = await CollisionDAO.byCollisionId(collisionId);
      if (collision === null) {
        return Boom.notFound(`no collision found with ID ${collisionId}`);
      }
    } catch (err) {
      const { statusCode } = HttpStatus.INTERNAL_SERVER_ERROR;
      return Boom.boomify(err, { statusCode, override: false, message: 'bad data preventing collision retrieval' });
    }
    return collision;
  },
});

/**
 * Fetch collisions matching the given query.  These are returned as an array of collision
 * details, one per matching collision.
 *
 * A query consists of a {@link CompositeId} containing selected centreline features, plus
 * additional filters on collision details.
 *
 * If no such collisions exist, returns an empty array.
 *
 * @memberof CollisionController
 * @name getCollisionsByCentreline
 */
CollisionController.push({
  method: 'GET',
  path: '/collisions/byCentreline',
  options: {
    auth: { mode: 'try' },
    description: 'Get collisions matching a collision query',
    response: {
      schema: Joi.array().items(CollisionEvent.read),
    },
    tags: ['api'],
    validate: {
      query: {
        ...CentrelineSelection,
        ...CollisionFilters,
      },
    },
  },
  handler: async (request) => {
    const { s1, ...collisionQuery } = request.query;
    const features = CompositeId.decode(s1);
    return CollisionDAO.byCentreline(features, collisionQuery);
  },
});

/**
 * Fetch summary statistics on collisions matching the given query.  This returns three
 * such statistics:
 *
 * - `amount`: the total number of matching collisions;
 * - `ksi`: the number of matching collisions that resulted in at least one serious injury
 *   or fatality;
 * - `validated`: the number of matching collisions that have been validated by internal
 *   City staff.
 *
 * @memberof CollisionController
 * @name getCollisionsByCentrelineSummary
 */
CollisionController.push({
  method: 'GET',
  path: '/collisions/byCentreline/summary',
  options: {
    auth: { mode: 'try' },
    description: 'Get summary statistics on collisions matching a collision query',
    response: {
      schema: {
        amount: Joi.number().integer().min(0).required(),
        ksi: Joi.number().integer().min(0).required(),
        validated: Joi.number().integer().min(0).required(),
      },
    },
    tags: ['api'],
    validate: {
      query: {
        ...CentrelineSelection,
        ...CollisionFilters,
      },
    },
  },
  handler: async (request) => {
    const { s1, ...collisionQuery } = request.query;
    const features = CompositeId.decode(s1);
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
    description: 'Get per-location summary statistics on collisions matching a collision query',
    response: {
      schema: Joi.array().items({
        amount: Joi.number().integer().min(0).required(),
        ksi: Joi.number().integer().min(0).required(),
        validated: Joi.number().integer().min(0).required(),
      }),
    },
    tags: ['api'],
    validate: {
      query: {
        ...CentrelineSelection,
        ...CollisionFilters,
      },
    },
  },
  handler: async (request) => {
    const { s1, ...collisionQuery } = request.query;
    const features = CompositeId.decode(s1);
    return CollisionDAO.byCentrelineSummaryPerLocation(features, collisionQuery);
  },
});

/**
 * Fetch total number of collisions at the given centreline features, regardless of
 * active filters.
 *
 * This value should match `amount` from
 * {@link CollisionController.getCollisionsByCentrelineSummary} when called with the
 * same `CentrelineSelection` and no filters.
 *
 * @memberof CollisionController
 * @name getCollisionsByCentrelineTotal
 */
CollisionController.push({
  method: 'GET',
  path: '/collisions/byCentreline/total',
  options: {
    auth: { mode: 'try' },
    description: 'Get total number of collisions at the given location(s)',
    response: {
      schema: {
        total: Joi.number().integer().min(0).required(),
      },
    },
    tags: ['api'],
    validate: {
      query: CentrelineSelection,
    },
  },
  handler: async (request) => {
    const { s1 } = request.query;
    const features = CompositeId.decode(s1);
    const total = await CollisionDAO.byCentrelineTotal(features);
    return { total };
  },
});

export default CollisionController;
