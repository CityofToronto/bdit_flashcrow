import {
  CollisionEmphasisArea,
} from '@/lib/Constants';
import Joi from '@/lib/model/Joi';
import TimeFormatters from '@/lib/time/TimeFormatters';

const DAYS_OF_WEEK_ALL = TimeFormatters.DAYS_OF_WEEK.map((_, i) => i);

export default {
  dateRangeEnd: Joi.dateTime().optional(),
  dateRangeStart: Joi.dateTime().optional(),
  daysOfWeek: Joi.array().single().items(
    Joi.number().valid(...DAYS_OF_WEEK_ALL).required(),
  ).default(null),
  emphasisAreas: Joi.array().single().items(
    Joi.enum().ofType(CollisionEmphasisArea).required(),
  ).default(null),
  hoursOfDayEnd: Joi.number().integer().min(0).optional(),
  hoursOfDayStart: Joi.number().integer().min(0).optional(),
  rdsfcond: Joi.array().single().items(
    Joi.number().integer().min(0).required(),
  ).default(null),
};
