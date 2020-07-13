import Boom from '@hapi/boom';

import { CentrelineType, LocationSearchType } from '@/lib/Constants';
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import LocationSearchDAO from '@/lib/db/LocationSearchDAO';
import RoutingDAO from '@/lib/db/RoutingDAO';
import CompositeId from '@/lib/io/CompositeId';
import Joi from '@/lib/model/Joi';
import CentrelineLocation from '@/lib/model/helpers/CentrelineLocation';
import CentrelineSelection from '@/lib/model/helpers/CentrelineSelection';

/**
 * Utilities for location suggestions and lookups.
 *
 * @type {Array<Hapi.ServerRoute>}
 */
const LocationController = [];

/**
 * Suggests locations to match the autocomplete query `q`.  This fetches both exact
 * matches (e.g. 'Danforth') and approximate matches (e.g. 'Damforth'), as well as
 * prefix queries in both cases (e.g. 'Danf' -> 'Danforth', 'Damf' -> 'Danforth').
 *
 * @memberof LocationController
 * @name getLocationSuggestions
 * @type {Hapi.ServerRoute}
 */
LocationController.push({
  method: 'GET',
  path: '/locations/suggest',
  options: {
    auth: { mode: 'try' },
    response: {
      schema: Joi.array().items(CentrelineLocation),
    },
    validate: {
      query: {
        limit: Joi
          .number()
          .integer()
          .positive()
          .max(100)
          .required(),
        q: Joi.string().min(3).required(),
        types: Joi.array().items(
          Joi.enum().ofType(LocationSearchType),
        ).default(null),
      },
    },
  },
  handler: async (request) => {
    const { limit, q, types } = request.query;
    return LocationSearchDAO.getSuggestions(types, q, limit);
  },
});

/**
 * Get a composite ID for the given centreline IDs and types.  `centrelineId` and
 * `centrelineType` are arrays of the same length such that each pair
 * `(centrelineType[i], centrelineId[i])` defines a single feature to lookup.
 *
 * @memberof LocationController
 * @name getCompositeId
 * @type {Hapi.ServerRoute}
 */
LocationController.push({
  method: 'GET',
  path: '/locations/compositeId',
  options: {
    auth: { mode: 'try' },
    response: {
      schema: CentrelineSelection,
    },
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
    const features = new Array(n)
      .fill()
      .map((_, i) => ({
        centrelineId: centrelineId[i],
        centrelineType: centrelineType[i],
      }));
    const s1 = CompositeId.encode(features);
    return { s1 };
  },
});

/**
 * Fetch centreline locations for the features in the given centreline selection.
 *
 * @memberof LocationController
 * @name getLocationsByCentreline
 * @type {Hapi.ServerRoute}
 */
LocationController.push({
  method: 'GET',
  path: '/locations/byCentreline',
  options: {
    auth: { mode: 'try' },
    response: {
      schema: Joi.array().items(CentrelineLocation),
    },
    validate: {
      query: CentrelineSelection,
    },
  },
  handler: async (request) => {
    const { s1: features } = request.query;
    return CentrelineDAO.byFeatures(features);
  },
});

/**
 * Fetch centreline locations that make up a corridor connecting the features in the given
 * centreline selection.
 *
 * @memberof LocationController
 * @name getLocationsByCorridor
 * @type {Hapi.ServerRoute}
 */
LocationController.push({
  method: 'GET',
  path: '/locations/byCorridor',
  options: {
    auth: { mode: 'try' },
    response: {
      schema: Joi.array().items(CentrelineLocation),
    },
    validate: {
      query: CentrelineSelection,
    },
  },
  handler: async (request) => {
    const { s1: features } = request.query;
    const corridor = await RoutingDAO.routeCorridor(features);
    if (corridor === null) {
      return Boom.notFound('no corridor found on the given location selection');
    }
    return CentrelineDAO.byFeatures(corridor);
  },
});

export default LocationController;
