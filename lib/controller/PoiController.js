import {
  CentrelineType,
} from '@/lib/Constants';
import PoiDAO from '@/lib/db/PoiDAO';
import Joi from '@/lib/model/Joi';

const PoiController = [];

PoiController.push({
  method: 'GET',
  path: '/poi/byCentreline/summary',
  options: {
    auth: { mode: 'try' },
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
    return PoiDAO.byCentrelineSummary(centrelineId, centrelineType);
  },
});

export default PoiController;
