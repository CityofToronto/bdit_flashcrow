import Joi from '@/lib/model/Joi';
import User from '@/lib/model/User';

export default {
  read: Joi.object().keys({
    csrf: Joi.string().required(),
    loggedIn: Joi.boolean().required(),
    user: User.read.allow(null).required(),
  }),
};
