import { CentrelineType } from '@/lib/Constants';
import Joi from '@/lib/model/Joi';

export default {
  centrelineId: Joi.number().integer().positive().required(),
  centrelineType: Joi.number().valid(
    CentrelineType.SEGMENT,
    CentrelineType.INTERSECTION,
  ).required(),
};
