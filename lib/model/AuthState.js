import Joi from '@/lib/model/Joi';
import User from '@/lib/model/User';

export default {
  read: Joi.object().keys({
    csrf: Joi
      .string()
      .required()
      .description('CSRF token, for use with non-GET endpoints'),
    loggedIn: Joi
      .boolean()
      .required()
      .description('Has the user logged in?'),
    user: User.read
      .allow(null)
      .required(),
  }),
};
