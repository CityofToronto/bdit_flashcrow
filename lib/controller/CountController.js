import Boom from '@hapi/boom';

import {
  CentrelineType,
  StudyHours,
  StudyType,
} from '@/lib/Constants';
import CountDAO from '@/lib/db/CountDAO';
import Category from '@/lib/model/Category';
import Count from '@/lib/model/Count';
import Joi from '@/lib/model/Joi';
import TimeFormatters from '@/lib/time/TimeFormatters';

const DAYS_OF_WEEK_ALL = TimeFormatters.DAYS_OF_WEEK.map((_, i) => i);

/**
 * Routes related to metadata for existing counts.  Note that this is different from
 * {@link StudyController}, which manages metadata for studies submitted via MOVE,
 * including studies that are still in progress.
 *
 * @type {Array<HapiRoute>}
 */
const CountController = [];

/**
 * Fetch a breakdown of available counts by type at the given centreline feature.
 *
 * @memberof CountController
 * @name getCountsByCentrelineSummary
 */
CountController.push({
  method: 'GET',
  path: '/counts/byCentreline/summary',
  options: {
    auth: { mode: 'try' },
    response: {
      schema: Joi.array().items(
        Joi.object().keys({
          category: Category.read,
          count: Count.read,
          numPerCategory: Joi.number().integer().positive().required(),
        }),
      ),
    },
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
          Joi.enum().ofType(StudyType).required(),
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
      if (start.valueOf() >= end.valueOf()) {
        return Boom.badRequest('invalid date range: start is after end');
      }
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

/**
 * Fetch total number of counts at the given centreline feature, regardless of active filters.
 *
 * @memberof CountController
 * @name getCountsByCentrelineTotal
 */
CountController.push({
  method: 'GET',
  path: '/counts/byCentreline/total',
  options: {
    auth: { mode: 'try' },
    response: {
      schema: {
        total: Joi.number().integer().min(0).required(),
      },
    },
    validate: {
      query: {
        centrelineId: Joi.number().integer().positive().required(),
        centrelineType: Joi.number().valid(
          CentrelineType.SEGMENT,
          CentrelineType.INTERSECTION,
        ).required(),
      },
    },
  },
  handler: async (request) => {
    const { centrelineId, centrelineType } = request.query;
    const total = await CountDAO.byCentrelineTotal(centrelineType, centrelineId);
    return { total };
  },
});

/**
 * Fetch metadata for counts of the given type at the given centreline feature, and
 * which match the given filters.
 *
 * @memberof CountController
 * @name getCountsByCentreline
 */
CountController.push({
  method: 'GET',
  path: '/counts/byCentreline/{studyType}',
  options: {
    auth: { mode: 'try' },
    response: {
      schema: Joi.array().items(Count.read),
    },
    validate: {
      params: {
        studyType: Joi.enum().ofType(StudyType).required(),
      },
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
        limit: Joi
          .number()
          .integer()
          .positive()
          .max(100)
          .required(),
        offset: Joi.number().integer().min(0).required(),
        start: Joi.dateTime().optional(),
      },
    },
  },
  handler: async (request) => {
    const { studyType } = request.params;
    const {
      centrelineId,
      centrelineType,
      dayOfWeek: daysOfWeek,
      end,
      hours,
      limit,
      offset,
      start,
    } = request.query;
    let dateRange = null;
    if (start !== undefined && end !== undefined) {
      if (start.valueOf() >= end.valueOf()) {
        return Boom.badRequest('invalid date range: start is after end');
      }
      dateRange = { start, end };
    }
    return CountDAO.byCentreline(
      centrelineId,
      centrelineType,
      studyType,
      dateRange,
      daysOfWeek,
      hours,
      limit,
      offset,
    );
  },
});

export default CountController;
