import Boom from '@hapi/boom';

import {
  CentrelineType,
  CollisionEmphasisArea,
  CollisionRoadSurfaceCondition,
} from '@/lib/Constants';
import CollisionDAO from '@/lib/db/CollisionDAO';
import CollisionEvent from '@/lib/model/CollisionEvent';
import Joi from '@/lib/model/Joi';
import TimeFormatters from '@/lib/time/TimeFormatters';

const DAYS_OF_WEEK_ALL = TimeFormatters.DAYS_OF_WEEK.map((_, i) => i);

const COLLISION_QUERY = {
  centrelineId: Joi.number().integer().positive().required(),
  centrelineType: Joi.number().valid(
    CentrelineType.SEGMENT,
    CentrelineType.INTERSECTION,
  ).required(),
  dateRangeEnd: Joi.dateTime().optional(),
  dateRangeStart: Joi.dateTime().optional(),
  daysOfWeek: Joi.array().single().items(
    Joi.number().valid(...DAYS_OF_WEEK_ALL).required(),
  ).default(null),
  emphasisAreas: Joi.array().single().items(
    Joi.enum().ofType(CollisionEmphasisArea).required(),
  ).default(null),
  hoursOfDayEnd: Joi.number().integer().positive().optional(),
  hoursOfDayStart: Joi.number().integer().positive().optional(),
  roadSurfaceConditions: Joi.array().single().items(
    Joi.enum().ofType(CollisionRoadSurfaceCondition).required(),
  ).default(null),
};

function normalizeCollisionQuery(collisionQuery) {
  const {
    dateRangeEnd,
    dateRangeStart,
    hoursOfDayEnd,
    hoursOfDayStart,
    ...collisionQueryRest
  } = collisionQuery;
  let dateRange = null;
  if (dateRangeStart !== undefined && dateRangeEnd !== undefined) {
    dateRange = { start: dateRangeStart, end: dateRangeEnd };
  }
  let hoursOfDay = null;
  if (hoursOfDayStart !== undefined && hoursOfDayEnd !== undefined) {
    hoursOfDay = [hoursOfDayStart, hoursOfDayEnd];
  }
  return {
    ...collisionQueryRest,
    dateRange,
    hoursOfDay,
  };
}

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
        id: Joi.number().integer().positive().required(),
      },
    },
  },
  handler: async (request) => {
    const { id } = request.params;
    const collision = await CollisionDAO.byCollisionId(id);
    if (collision === null) {
      return Boom.notFound(`no collision found with ID ${id}`);
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
      query: COLLISION_QUERY,
    },
  },
  handler: async (request) => {
    const collisionQuery = normalizeCollisionQuery(request.query);
    return CollisionDAO.byCentreline(collisionQuery);
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
      query: {
        centrelineId: Joi.number().integer().positive().required(),
        centrelineType: Joi.number().valid(
          CentrelineType.SEGMENT,
          CentrelineType.INTERSECTION,
        ).required(),
      },
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
      query: COLLISION_QUERY,
    },
  },
  handler: async (request) => {
    const collisionQuery = normalizeCollisionQuery(request.query);
    return CollisionDAO.byCentrelineSummary(collisionQuery);
  },
});

export default CollisionController;
