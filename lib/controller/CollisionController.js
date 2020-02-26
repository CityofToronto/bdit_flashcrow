import Boom from '@hapi/boom';

import {
  CentrelineType,
} from '@/lib/Constants';
import CollisionDAO from '@/lib/db/CollisionDAO';
import Joi from '@/lib/model/Joi';

const CollisionController = [];

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
