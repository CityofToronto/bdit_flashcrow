import Boom from '@hapi/boom';

import {
  CentrelineType,
} from '@/lib/Constants';
import CollisionDAO from '@/lib/db/CollisionDAO';
import Joi from '@/lib/model/Joi';

/**
 * Routes related to collisions data.
 *
 * @type {Array<HapiRoute>}
 */
const CollisionController = [];

/**
 * Fetch map popup details for the given collision.
 *
 * @memberof CollisionController
 * @name getCollisionPopupDetails
 */
CollisionController.push({
  method: 'GET',
  path: '/collisions/{id}/popupDetails',
  options: {
    auth: { mode: 'try' },
    validate: {
      params: {
        id: Joi.number().integer().positive().required(),
      },
    },
  },
  handler: async (request) => {
    const { id } = request.params;
    const collision = await CollisionDAO.byIdPopupDetails(id);
    if (collision.event === null) {
      return Boom.notFound(`no collision found with ID ${id}`);
    }
    return collision;
  },
});

/**
 * Fetch summary statistics on collisions for the given centreline feature
 * and time range.
 *
 * @memberof CollisionController
 * @name getCollisionsByCentrelineSummary
 */
CollisionController.push({
  method: 'GET',
  path: '/collisions/byCentreline/summary',
  options: {
    auth: { mode: 'try' },
    validate: {
      query: {
        centrelineId: Joi.number().integer().positive().required(),
        centrelineType: Joi.number().valid(
          CentrelineType.SEGMENT,
          CentrelineType.INTERSECTION,
        ).required(),
        end: Joi.dateTime().optional(),
        start: Joi.dateTime().optional(),
      },
    },
  },
  handler: async (request) => {
    const {
      centrelineId,
      centrelineType,
      end,
      start,
    } = request.query;
    let dateRange = null;
    if (start !== undefined && end !== undefined) {
      dateRange = { start, end };
    }
    return CollisionDAO.byCentrelineSummary(
      centrelineId,
      centrelineType,
      dateRange,
    );
  },
});

export default CollisionController;
