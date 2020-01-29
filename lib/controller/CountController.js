import Boom from '@hapi/boom';

import {
  CentrelineType,
  COUNT_TYPES,
  StudyHours,
} from '@/lib/Constants';
import CountDAO from '@/lib/db/CountDAO';
import CountDataDAO from '@/lib/db/CountDataDAO';
import Joi from '@/lib/model/Joi';
import TimeFormatters from '@/lib/time/TimeFormatters';

const COUNT_TYPES_ALL = COUNT_TYPES.map(({ value }) => value);
const DAYS_OF_WEEK_ALL = TimeFormatters.DAYS_OF_WEEK.map((_, i) => i);

const CountController = [];

CountController.push({
  method: 'GET',
  path: '/counts/byCentreline/summary',
  options: {
    auth: { mode: 'try' },
    validate: {
      query: {
        centrelineId: Joi.number().integer().positive().required(),
        centrelineType: Joi.number().valid(
          CentrelineType.SEGMENT,
          CentrelineType.INTERSECTION,
        ).required(),
        dayOfWeek: Joi.array().single().items(
          Joi.number().valid(...DAYS_OF_WEEK_ALL).required(),
        ).default(null),
        end: Joi.dateTime().optional(),
        hours: Joi.array().single().items(
          Joi.enum().ofType(StudyHours).required(),
        ).default(null),
        start: Joi.dateTime().optional(),
        studyType: Joi.array().single().items(
          Joi.string().valid(...COUNT_TYPES_ALL).required(),
        ).default(null),
      },
    },
  },
  handler: async (request) => {
    const {
      centrelineId,
      centrelineType,
      dayOfWeek: daysOfWeek,
      end,
      hours,
      start,
      studyType: studyTypes,
    } = request.query;
    let dateRange = null;
    if (start !== undefined && end !== undefined) {
      dateRange = { start, end };
    }
    return CountDAO.byCentrelineSummary(
      centrelineId,
      centrelineType,
      dateRange,
      daysOfWeek,
      hours,
      studyTypes,
    );
  },
});

CountController.push({
  method: 'GET',
  path: '/counts/byCentreline',
  options: {
    auth: { mode: 'try' },
    validate: {
      query: {
        centrelineId: Joi.number().integer().positive().required(),
        centrelineType: Joi.number().valid(
          CentrelineType.SEGMENT,
          CentrelineType.INTERSECTION,
        ).required(),
        end: Joi.dateTime().optional(),
        maxPerCategory: Joi
          .number()
          .integer()
          .positive()
          .max(100)
          .default(10),
        start: Joi.dateTime().optional(),
      },
    },
  },
  handler: async (request) => {
    const {
      centrelineId,
      centrelineType,
      end,
      maxPerCategory,
      start,
    } = request.query;
    let dateRange = null;
    if (start !== undefined && end !== undefined) {
      dateRange = { start, end };
    }
    return CountDAO.byCentreline(
      centrelineId,
      centrelineType,
      dateRange,
      maxPerCategory,
    );
  },
});

// COUNT DATA
CountController.push({
  method: 'GET',
  path: '/counts/data',
  options: {
    auth: { mode: 'try' },
    validate: {
      query: {
        countInfoId: Joi.number().integer().positive().required(),
        categoryId: Joi.number().integer().positive().required(),
      },
    },
  },
  handler: async (request) => {
    const { countInfoId, categoryId } = request.query;
    const count = await CountDAO.byIdAndCategory(countInfoId, categoryId);
    if (count === null) {
      return Boom.notFound(
        `no count found with ID ${countInfoId} and category ${categoryId}`,
      );
    }
    return CountDataDAO.byCount(count);
  },
});

export default CountController;
