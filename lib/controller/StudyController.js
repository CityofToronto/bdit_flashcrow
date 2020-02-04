import Joi from '@/lib/model/Joi';

import StudyDAO from '@/lib/db/StudyDAO';
import Study from '@/lib/model/Study';
import { CentrelineType } from '@/lib/Constants';

const StudyController = [];

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
