import Boom from '@hapi/boom';

import {
  CentrelineType,
  FEATURE_CODES_INTERSECTION,
  FEATURE_CODES_SEGMENT,
  LocationSearchType,
  MAX_LOCATIONS,
} from '@/lib/Constants';
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import LocationSearchDAO from '@/lib/db/LocationSearchDAO';
import RoutingDAO from '@/lib/db/RoutingDAO';
import CompositeId from '@/lib/io/CompositeId';
import Joi from '@/lib/model/Joi';
import CentrelineLocation from '@/lib/model/helpers/CentrelineLocation';
import CentrelineSelection from '@/lib/model/helpers/CentrelineSelection';

function filterLocations(locations) {
  return locations.filter(({ centrelineType, featureCode }) => {
    if (centrelineType === CentrelineType.INTERSECTION) {
      return FEATURE_CODES_INTERSECTION.includes(featureCode);
    }
    return FEATURE_CODES_SEGMENT.includes(featureCode);
  });
}

/**
 * Routes related to location suggestions and lookups.
 *
 * MOVE uses several different representations of location, depending on the circumstance:
 *
 * - `(lat, lng)` coordinates: for describing exact locations / geometries;
 * - `{ centrelineId, centrelineType }` "features": to identify specific intersections or
 *   midblock segments of the Toronto Centreline;
 * - "locations": features with additional metadata, such as a user-readable description,
 *   precise geometry, and intersection / midblock classification (e.g. major vs. minor
 *   roads);
 * - {@link CompositeId}: for passing arrays of features to the backend, or between
 *   backend services, in a compact manner.
 *
 * Most endpoints here return one or more _locations_.
 *
 * @type {Array<Hapi.ServerRoute>}
 */
const LocationController = [];

/**
 * Suggests locations to match the autocomplete query `q`.  This fetches both exact
 * matches (e.g. 'Danforth') and approximate matches (e.g. 'Damforth'), as well as
 * prefix queries in both cases (e.g. 'Danf' -> 'Danforth', 'Damf' -> 'Danforth').
 *
 * Returns an array of locations matching the query, up to `limit`.
 *
 * If no such locations exist, returns an empty array.
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
    const locations = await LocationSearchDAO.getSuggestions(types, q, limit);
    return filterLocations(locations);
  },
});

/**
 * Get a {@link CompositeId} for the given centreline IDs and types.  `centrelineId` and
 * `centrelineType` are arrays of the same length such that each pair
 * `(centrelineType[i], centrelineId[i])` defines a single feature to lookup.
 *
 * Note that this does not return locations.  To fetch locations, pass the resulting
 * {@link CompositeId} to {@link LocationController.getLocationsByCentreline}.
 *
 * HTTP 400 if the number of features in the request exceeds `CompositeId.MAX_FEATURES`.
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
 * Fetch centreline locations for the features in the given {@link CompositeId}.
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
    const { s1 } = request.query;
    const features = CompositeId.decode(s1);
    const locations = await CentrelineDAO.byFeatures(features);
    return filterLocations(locations);
  },
});

/**
 * Fetch centreline locations that make up a "corridor" connecting the features in the given
 * centreline selection.  A corridor is a sequence of locations that form a continuous path
 * in the Toronto Centreline.
 *
 * HTTP 400 if the number of features in the request exceeds `MAX_LOCATIONS`, or if the
 * number of features in the resulting corridor would exceed `CompositeId.MAX_FEATURES`.
 *
 * HTTP 404 if no corridor could be found on the given features.  (While the Toronto Centreline
 * should all be connected, this can occasionally happen in more complicated areas of the road
 * network.)
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
    const { s1 } = request.query;
    const features = CompositeId.decode(s1);
    if (features.length > MAX_LOCATIONS) {
      return Boom.badRequest(`cannot route corridor on more than ${MAX_LOCATIONS} locations`);
    }
    const corridor = await RoutingDAO.routeCorridor(features);
    if (corridor === null) {
      return Boom.notFound('no corridor found on the given location selection');
    }
    if (corridor.length > CompositeId.MAX_FEATURES) {
      return Boom.badRequest(
        `cannot return corridor with more than ${CompositeId.MAX_FEATURES} locations`,
      );
    }
    const locations = await CentrelineDAO.byFeatures(corridor);
    return filterLocations(locations);
  },
});

export default LocationController;
