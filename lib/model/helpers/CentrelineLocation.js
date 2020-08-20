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
