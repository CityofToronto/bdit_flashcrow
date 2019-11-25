import Joi from '@/lib/model/Joi';

export default {
  read: {
    email: Joi.string().email().required(),
    name: Joi.string().required(),
  },
};
