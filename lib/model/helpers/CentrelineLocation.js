import { CentrelineType, RoadIntersectionType, RoadSegmentType } from '@/lib/Constants';
import Joi from '@/lib/model/Joi';
import CentrelineFeature from '@/lib/model/helpers/CentrelineFeature';
import {
  Lat,
  LineString,
  Lng,
  Point,
} from '@/lib/model/helpers/GeoJson';

const FEATURE_CODES_INTERSECTION = RoadIntersectionType.enumValues.map(
  ({ featureCode }) => featureCode,
);
const FEATURE_CODES_SEGMENT = RoadSegmentType.enumValues.map(
  ({ featureCode }) => featureCode,
);

export default {
  ...CentrelineFeature,
  description: Joi.string().allow(null),
  featureCode: Joi.number().when(
    'centrelineType',
    {
      is: CentrelineType.INTERSECTION,
      then: Joi.valid(...FEATURE_CODES_INTERSECTION),
      otherwise: Joi.valid(...FEATURE_CODES_SEGMENT),
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
  roadId: Joi.number().allow(null),
};
