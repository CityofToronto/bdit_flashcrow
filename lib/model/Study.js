import { CentrelineType, StudyHours, StudyType } from '@/lib/Constants';
import Joi from '@/lib/model/Joi';
import { Point } from '@/lib/model/helpers/GeoJson';
import TimeFormatters from '@/lib/time/TimeFormatters';

const DAYS_OF_WEEK_ALL = TimeFormatters.DAYS_OF_WEEK.map((_, i) => i);

export default {
  read: Joi.object().keys({
    legacy: Joi.boolean().required(),
    countLocationId: Joi.number().integer().positive(),
    studyType: Joi.enum().ofType(StudyType).required(),
    countGroupId: Joi.number().integer().positive(),
    startDate: Joi.dateTime(),
    endDate: Joi.dateTime(),
    duration: Joi.number().integer().multiple(24).allow(null),
    daysOfWeek: Joi.array().single().items(
      Joi.number().valid(...DAYS_OF_WEEK_ALL).required(),
    ).default(null),
    hours: Joi.enum().ofType(StudyHours).allow(null),
    centrelineId: Joi.number().integer().positive(),
    centrelineType: Joi.number().valid(
      CentrelineType.INTERSECTION,
      CentrelineType.SEGMENT,
    ),
    geom: Point,
  }),
};
