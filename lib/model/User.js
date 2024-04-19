import { AuthScope } from '@/lib/Constants';
import Joi from '@/lib/model/Joi';

export default {
  read: Joi.object().keys({
    id: Joi.number().integer().positive().required(),
    createdAt: Joi.dateTime().required(),
    email: Joi.string().email({ tlds: false }).required(),
    scope: Joi.array().items(
      Joi.enum().ofType(AuthScope),
    ).required(),
    sub: Joi.string().required(),
    uniqueName: Joi.string().required(),
    mvcrExpiryDate: Joi.dateTime().allow(null).default(null),
    mvcrAcctType: Joi.number().integer().allow(null).default(0),
  }),
};
