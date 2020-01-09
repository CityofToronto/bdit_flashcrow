import Joi from '@/lib/model/Joi';

export default {
  read: {
    id: Joi.number().integer().positive().required(),
    createdAt: Joi.dateTime().required(),
    email: Joi.string().email().required(),
    sub: Joi.string().required(),
    uniqueName: Joi.string().required(),
  },
};
