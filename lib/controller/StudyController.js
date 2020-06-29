import Boom from '@hapi/boom';

import StudyDAO from '@/lib/db/StudyDAO';
import Category from '@/lib/model/Category';
import Joi from '@/lib/model/Joi';
import Study from '@/lib/model/Study';
import StudyFilters from '@/lib/model/StudyFilters';
import CentrelineSelection from '@/lib/model/helpers/CentrelineSelection';

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
        ...CentrelineSelection,
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
      s1: features,
      ...studyQuery
    } = request.query;
    try {
      const studies = await StudyDAO.byCentreline(features, studyQuery, { limit, offset });
      return studies;
    } catch (err) {
      return Boom.badRequest(err.message);
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
          category: Category.read,
          mostRecent: Study.read,
          n: Joi.number().integer().positive().required(),
        }),
      ),
    },
    validate: {
      query: {
        ...CentrelineSelection,
        ...StudyFilters,
      },
    },
  },
  handler: async (request) => {
    try {
      const { s1: features, ...studyQuery } = request.query;
      const studySummary = await StudyDAO.byCentrelineSummary(features, studyQuery);
      return studySummary;
    } catch (err) {
      return Boom.badRequest(err.message);
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
      query: CentrelineSelection,
    },
  },
  handler: async (request) => {
    const { s1: features } = request.query;
    const total = await StudyDAO.byCentrelineTotal(features);
    return { total };
  },
});

export default StudyController;
