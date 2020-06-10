import { CentrelineType, StudyHours } from '@/lib/Constants';
import Category from '@/lib/model/Category';
import Joi from '@/lib/model/Joi';
import GeoJson from '@/lib/model/helpers/GeoJson';
import TimeFormatters from '@/lib/time/TimeFormatters';

const DAYS_OF_WEEK_ALL = TimeFormatters.DAYS_OF_WEEK.map((_, i) => i);

export default {
  read: Joi.object().keys({
    arteryGroupId: Joi.number().integer().positive(),
    centrelineId: Joi.number().integer().positive(),
    centrelineType: Joi.number().valid(
      CentrelineType.INTERSECTION,
      CentrelineType.SEGMENT,
    ),
    countGroupId: Joi.number().integer().positive(),
    daysOfWeek: Joi.array().single().items(
      Joi.number().valid(...DAYS_OF_WEEK_ALL).required(),
    ).default(null),
    duration: Joi.number().integer().multiple(24).allow(null),
    geom: GeoJson.Point,
    hours: Joi.enum().ofType(StudyHours).allow(null),
    endDate: Joi.dateTime(),
    startDate: Joi.dateTime(),
    type: Category.read,
  }),
};
