import { CentrelineType } from '@/lib/Constants';
import Joi from '@/lib/model/Joi';
import { Point } from '@/lib/model/helpers/GeoJson';

const COLUMNS = {
  id: Joi.number().integer().positive().required(),
  legacy: Joi.boolean().required(),
  description: Joi.string().required(),
  centrelineId: Joi.number().integer().positive().required(),
  centrelineType: Joi.number().valid(
    CentrelineType.SEGMENT,
    CentrelineType.INTERSECTION,
  ).required(),
  geom: Point,
};

export default {
  read: Joi.object().keys(COLUMNS),
};
