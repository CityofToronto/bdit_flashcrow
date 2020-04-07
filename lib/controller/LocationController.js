import Joi from '@/lib/model/Joi';

import CentrelineDAO from '@/lib/db/CentrelineDAO';
import { CentrelineType } from '@/lib/Constants';

/**
 * Utilities for location suggestions and lookups.
 *
 * @type {Array<Hapi.ServerRoute>}
 */
const LocationController = [];

/**
 * @memberof LocationController
 * @name getLocationSuggestions
 * @type {Hapi.ServerRoute}
 */
LocationController.push({
  method: 'GET',
  path: '/location/suggest',
  options: {
    auth: { mode: 'try' },
    validate: {
      query: {
        q: Joi.string().min(3).required(),
        limit: Joi
          .number()
          .integer()
          .positive()
          .max(100)
          .required(),
      },
    },
  },
  handler: async (request) => {
    const { limit, q } = request.query;
    return CentrelineDAO.intersectionSuggestions(q, limit);
  },
});

/**
 * @memberof LocationController
 * @name getLocationsByFeature
 * @type {Hapi.ServerRoute}
 */
LocationController.push({
  method: 'GET',
  path: '/location/centreline',
  options: {
    auth: { mode: 'try' },
    validate: {
      query: {
        centrelineId: Joi.array().single().items(
          Joi.number().integer().positive().required(),
        ).required(),
        centrelineType: Joi
          .array()
          .single()
          .items(
            Joi.number().valid(
              CentrelineType.SEGMENT,
              CentrelineType.INTERSECTION,
            ),
          )
          .length(Joi.ref('centrelineId.length'))
          .required(),
      },
    },
  },
  handler: async (request) => {
    const {
      centrelineId,
      centrelineType,
    } = request.query;
    const n = centrelineId.length;
    const centrelineIdsAndTypes = new Array(n)
      .fill()
      .map((_, i) => ({
        centrelineId: centrelineId[i],
        centrelineType: centrelineType[i],
      }));
    return CentrelineDAO.byIdsAndTypes(centrelineIdsAndTypes);
  },
});

export default LocationController;
