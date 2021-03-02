import Boom from '@hapi/boom';

import { AuthScope } from '@/lib/Constants';
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
 * Get all users.
 *
 * Currently this does not paginate results, but it may do so in the future.
 *
 * @memberof UserController
 * @name getUsers
 * @type {Hapi.ServerRoute}
 */
UserController.push({
  method: 'GET',
  path: '/users',
  options: {
    description: 'Get all users',
    response: {
      schema: Joi.array().items(User.read),
    },
    tags: ['api'],
  },
  handler: async () => UserDAO.all(),
});

/**
 * Get user names and emails for the given user IDs.
 *
 * Returns an array of two-element arrays `[id, user]`, such as can be passed to the `Map`
 * constructor.
 *
 * @memberof UserController
 * @name getUsersByIds
 * @type {Hapi.ServerRoute}
 */
UserController.push({
  method: 'GET',
  path: '/users/byId',
  options: {
    description: 'Get the given users',
    response: {
      schema: Joi.array().items(
        Joi.array().ordered(
          Joi.number().integer().positive().required(),
          User.read,
        ),
      ),
    },
    tags: ['api'],
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
    const users = await UserDAO.byIds(ids);
    return Array.from(users);
  },
});

/**
 * Update the given user.
 *
 * The request body should contain the user, and the ID of the request URI
 * should match the ID of the user in the body.
 *
 * HTTP 400 if updating the given user to the given payload would change a non-updatable
 * field.
 *
 * @memberof UserController
 * @name putUser
 * @type {Hapi.ServerRoute}
 */
UserController.push({
  method: 'PUT',
  path: '/users/{id}',
  options: {
    auth: {
      scope: [AuthScope.ADMIN.name],
    },
    description: 'Update the given user',
    response: {
      schema: User.read,
    },
    tags: ['api'],
    validate: {
      params: {
        id: Joi.number().integer().positive().required(),
      },
      payload: User.read,
    },
  },
  handler: async (request) => {
    const { id } = request.params;
    const userNew = request.payload;

    const userOld = await UserDAO.byId(id);
    if (userOld === null) {
      return Boom.notFound(`no user found with ID ${id}`);
    }

    if (userNew.id !== userOld.id) {
      return Boom.badRequest('cannot change ID for user');
    }
    if (!userNew.createdAt.equals(userOld.createdAt)) {
      return Boom.badRequest('cannot change creation timestamp for user');
    }
    if (userNew.sub !== userOld.sub) {
      return Boom.badRequest('cannot change subject identifier for user');
    }

    return UserDAO.update(userNew);
  },
});

export default UserController;
