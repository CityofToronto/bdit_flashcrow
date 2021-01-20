import {
  CentrelineType,
  FEATURE_CODES_INTERSECTION,
  FEATURE_CODES_SEGMENT,
} from '@/lib/Constants';
import Joi from '@/lib/model/Joi';
import CentrelineFeature from '@/lib/model/helpers/CentrelineFeature';
import {
  Lat,
  LineString,
  Lng,
  Point,
} from '@/lib/model/helpers/GeoJson';

/**
 * @typedef {Object} CentrelineLocation
 * @property {number?} aadt - annual average daily traffic (AADT, midblocks only)
 * @property {number} centrelineId - ID of location
 * @property {number} centrelineType - type of location
 * @property {string?} classification - intersection classification (intersections only)
 * @property {string} description - human-readable description
 * @property {number} featureCode - code identifying intersection or midblock type
 * @property {Object} geom - GeoJSON representation of intersection or midblock geometry
 * @property {number} lat - latitude of intersection, or of midblock centroid
 * @property {number} lng - longitude of intersection, or of midblock centroid
 * @property {number?} roadId - identifies midblocks belonging to the same road (midblocks only)
 */

export default {
  ...CentrelineFeature,
  aadt: Joi.any().when(
    'centrelineType',
    {
      is: CentrelineType.INTERSECTION,
      then: Joi.forbidden(),
      otherwise: Joi.number().positive().allow(null).required(),
    },
  ),
  classification: Joi.any().when(
    'centrelineType',
    {
      is: CentrelineType.INTERSECTION,
      then: Joi.string().allow(null).required(),
      otherwise: Joi.forbidden(),
    },
  ),
  description: Joi.string().allow(null).required(),
  featureCode: Joi.number().when(
    'centrelineType',
    {
      is: CentrelineType.INTERSECTION,
      then: Joi.valid(...FEATURE_CODES_INTERSECTION).required(),
      otherwise: Joi.valid(...FEATURE_CODES_SEGMENT).required(),
    },
  ),
  geom: Joi.any().when(
    'centrelineType',
    {
      is: CentrelineType.INTERSECTION,
      then: Point.required(),
      otherwise: LineString.required(),
    },
  ),
  lat: Lat.required(),
  lng: Lng.required(),
  roadId: Joi.any().when(
    'centrelineType',
    {
      is: CentrelineType.INTERSECTION,
      then: Joi.forbidden(),
      otherwise: Joi.number().allow(null),
    },
  ),
};
