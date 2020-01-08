import UserDAO from '@/lib/db/UserDAO';
import Joi from '@/lib/model/Joi';
import User from '@/lib/model/User';

/**
 * Utilities for user lookups.
 *
 * @type {Array<Hapi.ServerRoute>}
 */
const UserController = [];

/**
 * Get user names and emails for the given user IDs.
 *
 * @memberof UserController
 * @name getUsersByIds
 * @type {Hapi.ServerRoute}
 */
UserController.push({
  method: 'GET',
  path: '/users/byId',
  options: {
    response: {
      schema: Joi.array().items(
        Joi.array().ordered(
          Joi.number().integer().positive().required(),
          User.read,
        ),
      ),
    },
    validate: {
      query: {
        id: Joi.array().single().items(
          Joi.number().integer().positive().required(),
        ).required(),
      },
    },
  },
  handler: async (request) => {
    const { id: ids } = request.query;
    return UserDAO.byIds(ids);
  },
});

export default UserController;
