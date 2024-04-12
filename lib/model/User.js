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
    mvcrAddedAt: Joi.dateTime().allow(null).default(null),
    mvcrRemovedAt: Joi.dateTime().allow(null).default(null),
    mvcrAddedBy: Joi.number().integer().positive().allow(null)
      .default(null),
    mvcrRemovedBy: Joi.number().integer().positive().allow(null)
      .default(null),
  }),
};
