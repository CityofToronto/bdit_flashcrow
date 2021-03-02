import Boom from '@hapi/boom';

import {
  CentrelineType,
  HttpStatus,
  LocationSelectionType,
  LocationSearchType,
} from '@/lib/Constants';
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import LocationSearchDAO from '@/lib/db/LocationSearchDAO';
import { InvalidFeaturesSelectionError } from '@/lib/error/MoveErrors';
import FeatureResolver from '@/lib/geo/FeatureResolver';
import CompositeId from '@/lib/io/CompositeId';
import Joi from '@/lib/model/Joi';
import CentrelineLocation from '@/lib/model/helpers/CentrelineLocation';
import CentrelineSelection from '@/lib/model/helpers/CentrelineSelection';

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
    tags: ['api'],
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
    tags: ['api'],
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
      schema: Joi.array().items(
        Joi.object().keys(CentrelineLocation).allow(null),
      ),
    },
    tags: ['api'],
    validate: {
      query: CentrelineSelection,
    },
  },
  handler: async (request) => {
    const { s1 } = request.query;
    const features = CompositeId.decode(s1);
    return CentrelineDAO.byFeatures(features);
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
    tags: ['api'],
    validate: {
      query: CentrelineSelection,
    },
  },
  handler: async (request) => {
    const { s1 } = request.query;
    const features = CompositeId.decode(s1);
    const featuresSelection = {
      features,
      selectionType: LocationSelectionType.CORRIDOR,
    };
    try {
      const featuresResolved = await FeatureResolver.byFeaturesSelection(featuresSelection);
      const locations = await CentrelineDAO.byFeatures(featuresResolved);
      /*
       * Our resolved features here are from the routing target, which may include intersections
       * that are not in the conflation target.  During location lookup,
       * `CentrelineDAO.byFeatures` will return `null` for such features, so we need to filter
       * those out.
       */
      return locations.filter(location => location !== null);
    } catch (err) {
      if (err instanceof InvalidFeaturesSelectionError) {
        const { statusCode } = HttpStatus.BAD_REQUEST;
        return Boom.boomify(err, { statusCode, override: false });
      }
      throw err;
    }
  },
});

export default LocationController;
