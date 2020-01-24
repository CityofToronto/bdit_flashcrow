import {
  CentrelineType,
} from '@/lib/Constants';
import CollisionDAO from '@/lib/db/CollisionDAO';
import Joi from '@/lib/model/Joi';

const CollisionController = [];

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
