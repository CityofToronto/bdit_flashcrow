import { CentrelineType } from '@/lib/Constants';
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
  description: Joi.string().allow(null),
  featureCode: Joi.number().allow(null),
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
