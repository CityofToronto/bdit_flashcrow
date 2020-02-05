import { CentrelineType, StudyHours } from '@/lib/Constants';
import Category from '@/lib/model/Category';
import Joi from '@/lib/model/Joi';
import GeoJson from '@/lib/model/helpers/GeoJson';

const COLUMNS = {
  id: Joi.number().integer().positive().required(),
  arteryCode: Joi.number().integer().positive().required(),
  stationCode: Joi.string().required(),
  date: Joi.dateTime().required(),
  hours: Joi.enum().ofType(StudyHours).allow(null).required(),
  duration: Joi
    .number()
    .integer()
    .positive()
    .allow(null)
    .required(),
  type: Category.read,
  locationDesc: Joi.string().required(),
  centrelineId: Joi.number().integer().positive().required(),
  centrelineType: Joi.number().valid(
    CentrelineType.SEGMENT,
    CentrelineType.INTERSECTION,
  ).required(),
  notes: Joi.string().allow(null).required(),
  geom: GeoJson.Point,
};

export default {
  read: Joi.object().keys(COLUMNS),
};
