import PoiDAO from '@/lib/db/PoiDAO';
import Joi from '@/lib/model/Joi';
import CentrelineFeature from '@/lib/model/helpers/CentrelineFeature';

/**
 * Routes for point-of-interest lookups.
 *
 * While MOVE focuses on collision and traffic volume data, points-of-interest can provide useful
 * contextual information to users, and can help inform analysis of that data.  For instance,
 * school zones have additional considerations around the safety of schoolchildren.
 *
 * @type {Array<Hapi.ServerRoute>}
 */
const PoiController = [];

/**
 * Fetch a summary of points-of-interest within the given `radius` (in metres) of the given
 * centreline feature.
 *
 * Returns an object with `{ pointOfInterestType: pointOfInterest? }` key-value pairs.  The
 * values here indicate the nearest point-of-interest of the given type, or `null` if no
 * such point-of-interest exists within the given `radius`.
 *
 * `radius` is limited to 1000m (1km) for performance reasons: it is used to form an
 * `ST_DWithin` query in PostgreSQL.
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
    description: 'Get points of interest near the given location',
    tags: ['api'],
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
