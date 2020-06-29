import PoiDAO from '@/lib/db/PoiDAO';
import Joi from '@/lib/model/Joi';
import CentrelineFeature from '@/lib/model/helpers/CentrelineFeature';

/**
 * Utilities for point-of-interest lookups.
 *
 * @type {Array<Hapi.ServerRoute>}
 */
const PoiController = [];

/**
 * Fetch a summary of points-of-interest within the given radius of the given centreline
 * feature.
 *
 * @memberof PoiController
 * @name getPoiByCentrelineSummary
 * @type {Hapi.ServerRoute}
 */
PoiController.push({
  method: 'GET',
  path: '/poi/byCentreline/summary',
  options: {
    auth: { mode: 'try' },
    validate: {
      query: {
        ...CentrelineFeature,
        radius: Joi.number().positive().max(1000).required(),
      },
    },
  },
  handler: async (request) => {
    const { centrelineId, centrelineType, radius } = request.query;
    return PoiDAO.byCentrelineSummary(centrelineId, centrelineType, radius);
  },
});

export default PoiController;
