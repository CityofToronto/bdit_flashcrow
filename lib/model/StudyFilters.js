import { StudyHours, StudyType } from '@/lib/Constants';
import Joi from '@/lib/model/Joi';
import TimeFormatters from '@/lib/time/TimeFormatters';

const DAYS_OF_WEEK_ALL = TimeFormatters.DAYS_OF_WEEK.map((_, i) => i);

export default {
  dateRangeEnd: Joi.dateTime().optional(),
  dateRangeStart: Joi.dateTime().optional(),
  daysOfWeek: Joi.array().single().items(
    Joi.number().valid(...DAYS_OF_WEEK_ALL).required(),
  ).default(null),
  hours: Joi.array().single().items(
    Joi.enum().ofType(StudyHours).required(),
  ).default(null),
  studyTypes: Joi.array().single().items(
    Joi.enum().ofType(StudyType).required(),
  ).default(null),
};
