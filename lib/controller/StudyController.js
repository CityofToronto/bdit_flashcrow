import Boom from '@hapi/boom';

import { StudyType } from '@/lib/Constants';
import StudyDAO from '@/lib/db/StudyDAO';
import { InvalidStudyQueryError } from '@/lib/error/MoveErrors';
import Joi from '@/lib/model/Joi';
import Study from '@/lib/model/Study';
import StudyFilters from '@/lib/model/StudyFilters';
import CentrelineFeature from '@/lib/model/helpers/CentrelineFeature';

/**
 * Access to multi-directional, multi-day study data.
 *
 * @type {Array<Hapi.ServerRoute>}
 */
const StudyController = [];

/**
 * Fetch summary statistics on counts matching the given query.
 *
 * @memberof StudyController
 * @name getStudiesByCentreline
 */
StudyController.push({
  method: 'GET',
  path: '/studies/byCentreline',
  options: {
    auth: { mode: 'try' },
    response: {
      schema: Joi.array().items(Study.read),
    },
    validate: {
      query: {
        ...CentrelineFeature,
        ...StudyFilters,
        limit: Joi
          .number()
          .integer()
          .positive()
          .max(100)
          .required(),
        offset: Joi.number().integer().min(0).required(),
      },
    },
  },
  handler: async (request) => {
    const {
      limit,
      offset,
      ...studyQuery
    } = request.query;
    try {
      const studies = await StudyDAO.byCentreline(studyQuery, { limit, offset });
      return studies;
    } catch (err) {
      if (err instanceof InvalidStudyQueryError) {
        throw Boom.badRequest(err.message);
      }
      throw err;
    }
  },
});

/**
 * Fetch summary statistics on counts matching the given query.
 *
 * @memberof StudyController
 * @name getStudiesByCentrelineSummary
 */
StudyController.push({
  method: 'GET',
  path: '/studies/byCentreline/summary',
  options: {
    auth: { mode: 'try' },
    response: {
      schema: Joi.array().items(
        Joi.object().keys({
          studyType: Joi.enum().ofType(StudyType).allow(null),
          study: Study.read,
          n: Joi.number().integer().positive().required(),
        }),
      ),
    },
    validate: {
      query: {
        ...CentrelineFeature,
        ...StudyFilters,
      },
    },
  },
  handler: async (request) => {
    try {
      const studySummary = await StudyDAO.byCentrelineSummary(request.query);
      return studySummary;
    } catch (err) {
      if (err instanceof InvalidStudyQueryError) {
        throw Boom.badRequest(err.message);
      }
      throw err;
    }
  },
});

/**
 * Fetch summary statistics on counts matching the given query.
 *
 * @memberof StudyController
 * @name getStudiesByCentrelineTotal
 */
StudyController.push({
  method: 'GET',
  path: '/studies/byCentreline/total',
  options: {
    auth: { mode: 'try' },
    response: {
      schema: {
        total: Joi.number().integer().min(0).required(),
      },
    },
    validate: {
      query: CentrelineFeature,
    },
  },
  handler: async (request) => {
    const { centrelineId, centrelineType } = request.query;
    const total = await StudyDAO.byCentrelineTotal(centrelineType, centrelineId);
    return { total };
  },
});

export default StudyController;
