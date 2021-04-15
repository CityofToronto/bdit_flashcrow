import { StudyHours, StudyType } from '@/lib/Constants';
import Joi from '@/lib/model/Joi';
import TimeFormatters from '@/lib/time/TimeFormatters';

const DAYS_OF_WEEK_ALL = TimeFormatters.DAYS_OF_WEEK.map((_, i) => i);

export default {
  dateRangeEnd: Joi.dateTime().allow(null).default(null),
  dateRangeStart: Joi.dateTime().allow(null).default(null),
  daysOfWeek: Joi.array().single().items(
    Joi.number().valid(...DAYS_OF_WEEK_ALL),
  ).default([]),
  hours: Joi.array().single().items(
    Joi.enum().ofType(StudyHours),
  ).default([]),
  studyTypes: Joi.array().single().items(
    Joi.enum().ofType(StudyType),
  ).default([]),
};
