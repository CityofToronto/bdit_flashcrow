import {
  CollisionDetail,
  CollisionEmphasisArea,
  CollisionSource,
} from '@/lib/Constants';
import Joi from '@/lib/model/Joi';
import TimeFormatters from '@/lib/time/TimeFormatters';

const DAYS_OF_WEEK_ALL = TimeFormatters.DAYS_OF_WEEK.map((_, i) => i);

export default {
  dateRangeEnd: Joi.dateTime().allow(null).default(null),
  dateRangeStart: Joi.dateTime().allow(null).default(null),
  daysOfWeek: Joi.array().single().items(
    Joi.number().valid(...DAYS_OF_WEEK_ALL),
  ).default([]),
  details: Joi.array().single().items(
    Joi.enum().ofType(CollisionDetail),
  ).default([]),
  sources: Joi.array().single().items(
    Joi.enum().ofType(CollisionSource),
  ).default([]),
  drivact: Joi.array().single().items(
    Joi.number().integer().min(0),
  ).default([]),
  drivcond: Joi.array().single().items(
    Joi.number().integer().min(0),
  ).default([]),
  emphasisAreas: Joi.array().single().items(
    Joi.enum().ofType(CollisionEmphasisArea),
  ).default([]),
  hoursOfDayEnd: Joi
    .number()
    .integer()
    .min(0)
    .max(24)
    .default(24),
  hoursOfDayStart: Joi
    .number()
    .integer()
    .min(0)
    .max(24)
    .default(0),
  impactype: Joi.array().single().items(
    Joi.number().integer().min(0),
  ).default([]),
  initdir: Joi.array().single().items(
    Joi.number().integer().min(0),
  ).default([]),
  injury: Joi.array().single().items(
    Joi.number().integer().min(0),
  ).default([]),
  manoeuver: Joi.array().single().items(
    Joi.number().integer().min(0),
  ).default([]),
  mvcr: Joi.boolean().allow(null).default(null),
  rdsfcond: Joi.array().single().items(
    Joi.number().integer().min(0),
  ).default([]),
  validated: Joi.boolean().allow(null).default(null),
  vehtype: Joi.array().single().items(
    Joi.number().integer().min(0),
  ).default([]),
};
