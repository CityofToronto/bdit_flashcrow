import Joi from '@hapi/joi';

import StudyDAO from '@/../lib/db/StudyDAO';
import Study from '@/../lib/model/Study';
import { CentrelineType } from '@/lib/Constants';

const StudyController = [];

StudyController.push({
  method: 'GET',
  path: '/studies/byCentreline',
  options: {
    response: {
      schema: Joi.array().items(Study.persisted),
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
    return StudyDAO.byCentreline(centrelineId, centrelineType);
  },
});

export default StudyController;
