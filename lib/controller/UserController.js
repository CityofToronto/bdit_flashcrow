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
 * Get user names and emails for the given auth provider subjects.
 *
 * @memberof UserController
 * @name getUsersBySubjects
 * @type {Hapi.ServerRoute}
 */
UserController.push({
  method: 'GET',
  path: '/users/bySubject',
  options: {
    response: {
      schema: Joi.array().items(
        Joi.array().ordered(
          Joi.string().uuid().required(),
          User.read,
        ),
      ),
    },
    validate: {
      query: {
        subject: Joi.array().single().items(
          Joi.string().uuid().required(),
        ).required(),
      },
    },
  },
  handler: async (request) => {
    const { subject } = request.query;
    const users = await UserDAO.bySubjects(subject);
    const filteredUsers = new Map();
    users.forEach(({ email, name }, userSubject) => {
      filteredUsers.set(userSubject, { email, name });
    });
    return Array.from(filteredUsers);
  },
});

export default UserController;
