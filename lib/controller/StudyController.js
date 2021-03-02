import Boom from '@hapi/boom';

import StudyDAO from '@/lib/db/StudyDAO';
import CompositeId from '@/lib/io/CompositeId';
import Category from '@/lib/model/Category';
import Joi from '@/lib/model/Joi';
import Study from '@/lib/model/Study';
import StudyFilters from '@/lib/model/StudyFilters';
import CentrelineSelection from '@/lib/model/helpers/CentrelineSelection';

/**
 * Routes related to multi-directional, multi-day traffic studies.
 *
 * Note that these do not access the underlying traffic study data; use {@link StudyDataDAO}
 * for direct database access, or {@link ReportController} to access data in report form
 * through the API.
 *
 * These instead return metadata on traffic studies: location, start and end date, etc.
 *
 * @type {Array<Hapi.ServerRoute>}
 */
const StudyController = [];

/**
 * Fetch traffic studies matching the given query.
 *
 * A query consists of a {@link CompositeId} containing selected centreline features, plus
 * additional filters on traffic study details.
 *
 * If no such traffic studies exist, returns an empty array.
 *
 * @memberof StudyController
 * @name getStudiesByCentreline
 */
StudyController.push({
  method: 'GET',
  path: '/studies/byCentreline',
  options: {
    auth: { mode: 'try' },
    description: 'Get studies matching a study query',
    response: {
      schema: Joi.array().items(Study.read),
    },
    tags: ['api'],
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
      s1,
      ...studyQuery
    } = request.query;
    const features = CompositeId.decode(s1);
    try {
      const pagination = { limit, offset };
      const studies = await StudyDAO.byCentreline(features, studyQuery, pagination);
      return studies;
    } catch (err) {
      return Boom.badRequest(err.message);
    }
  },
});

/**
 * Fetch summary statistics on traffic studies matching the given query.
 *
 * This returns an array by category.  Only categories for which there is at least one matching
 * study are represented in this array.  These entries contain three fields:
 *
 * - `category`: the category of traffic study represented by this entry;
 * - `mostRecent`: the most recent matching traffic study of that category;
 * - `n`: the number of matching traffic studies of that category.
 *
 * @memberof StudyController
 * @name getStudiesByCentrelineSummary
 */
StudyController.push({
  method: 'GET',
  path: '/studies/byCentreline/summary',
  options: {
    auth: { mode: 'try' },
    description: 'Get summary statistics on studies matching a study query',
    response: {
      schema: Joi.array().items(
        Joi.object().keys({
          category: Category.read,
          mostRecent: Study.read,
          n: Joi.number().integer().positive().required(),
        }),
      ),
    },
    tags: ['api'],
    validate: {
      query: {
        ...CentrelineSelection,
        ...StudyFilters,
      },
    },
  },
  handler: async (request) => {
    try {
      const { s1, ...studyQuery } = request.query;
      const features = CompositeId.decode(s1);
      const studySummary = await StudyDAO.byCentrelineSummary(features, studyQuery);
      return studySummary;
    } catch (err) {
      return Boom.badRequest(err.message);
    }
  },
});

/**
 * Fetch summary statistics on traffic studies matching the given query, broken down per location.
 *
 * This returns an array of arrays, first by category and then by location.  Only categories for
 * which there is at least one matching study are represented in this first-level array.
 *
 * These second-level arrays contain one element per feature in the given `CentrelineSelection`,
 * regardless of whether they have matching studies of the first-level category, in the same order
 * as they appear in that selection.  Since selections can contain duplicate features (e.g. if a
 * selected corridor loops back on itself), the sum of `n` values in the response may exceed:
 *
 * - the total per category as determined using
 *   {@link CollisionController.getCollisionsByCentrelineSummary};
 * - the overall total as determined using
 *   {@link CollisionController.getCollisionsByCentrelineTotal}.
 *
 * If consistency between summary and total stats is desired, you should either pass a
 * `CentrelineSelection` containing unique features here, or post-process the result to only
 * consider summary stats from unique features, or use those two endpoints to retrieve summary
 * and total stats as needed.
 *
 * @memberof StudyController
 * @name getStudiesByCentrelineSummaryPerLocation
 */
StudyController.push({
  method: 'GET',
  path: '/studies/byCentreline/summaryPerLocation',
  options: {
    auth: { mode: 'try' },
    description: 'Get per-location summary statistics on studies matching a study query',
    response: {
      schema: Joi.array().items(
        Joi.object().keys({
          category: Category.read,
          perLocation: Joi.array().items(
            Joi.object().keys({
              mostRecent: Study.read.allow(null),
              n: Joi.number().integer().min(0).required(),
            }),
          ),
        }),
      ),
    },
    tags: ['api'],
    validate: {
      query: {
        ...CentrelineSelection,
        ...StudyFilters,
      },
    },
  },
  handler: async (request) => {
    try {
      const { s1, ...studyQuery } = request.query;
      const features = CompositeId.decode(s1);
      const studySummaryPerLocation = await StudyDAO.byCentrelineSummaryPerLocation(
        features,
        studyQuery,
      );
      return studySummaryPerLocation;
    } catch (err) {
      return Boom.badRequest(err.message);
    }
  },
});

/**
 * Fetch total number of traffic studies at the given centreline features, regardless
 * of active filters.
 *
 * This value should match the sum of `n` values from the per-category entries of
 * {@link StudyController.getStudiesByCentrelineSummary} when called with the same
 * `CentrelineSelection` and no filters.
 *
 * @memberof StudyController
 * @name getStudiesByCentrelineTotal
 */
StudyController.push({
  method: 'GET',
  path: '/studies/byCentreline/total',
  options: {
    auth: { mode: 'try' },
    description: 'Get total number of studies at the given location(s)',
    response: {
      schema: {
        total: Joi.number().integer().min(0).required(),
      },
    },
    tags: ['api'],
    validate: {
      query: CentrelineSelection,
    },
  },
  handler: async (request) => {
    const { s1 } = request.query;
    const features = CompositeId.decode(s1);
    const total = await StudyDAO.byCentrelineTotal(features);
    return { total };
  },
});

export default StudyController;
