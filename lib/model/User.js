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
    userTitle: Joi.string().allow(null).default(null),
    firstName: Joi.string().allow(null).default(null),
    lastName: Joi.string().allow(null).default(null),
    department: Joi.string().allow(null).default(null),
    mvcrExpiryDate: Joi.dateTime().allow(null).default(null),
    mvcrAcctType: Joi.number().integer().allow(null).default(0),
  }),
};
