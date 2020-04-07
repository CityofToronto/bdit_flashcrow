import Joi from '@/lib/model/Joi';

import StudyDAO from '@/lib/db/StudyDAO';
import Study from '@/lib/model/Study';
import { CentrelineType } from '@/lib/Constants';

/**
 * Routes related to metadata for studies submitted via MOVE.  Note that this is different from
 * {@link CountController}, which manages metadata for counts that have already been conducted
 * and for which data has been loaded via Flow Load.
 *
 * Note also that most CRUD operations on studies are done at the study request level within
 * {@link StudyRequestController}.
 *
 * @type {Array<HapiRoute>}
 */
const StudyController = [];

/**
 * Fetch pending studies at the given centreline feature.
 *
 * @memberof StudyController
 * @name getStudiesByCentrelinePending
 */
StudyController.push({
  method: 'GET',
  path: '/studies/byCentreline/pending',
  options: {
    response: {
      schema: Joi.array().items(Study.read),
    },
    validate: {
      query: {
        centrelineId: Joi.number().integer().positive().required(),
        centrelineType: Joi.number().valid(
          CentrelineType.SEGMENT,
          CentrelineType.INTERSECTION,
        ),
      },
    },
  },
  handler: async (request) => {
    const {
      centrelineId,
      centrelineType,
    } = request.query;
    return StudyDAO.byCentrelinePending(centrelineId, centrelineType);
  },
});

export default StudyController;
