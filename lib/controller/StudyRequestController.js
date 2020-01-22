import Boom from '@hapi/boom';
import Joi from '@hapi/joi';

import StudyRequestDAO from '@/lib/db/StudyRequestDAO';
import StudyRequestCommentDAO from '@/lib/db/StudyRequestCommentDAO';
import EmailStudyRequestConfirmation from '@/lib/email/EmailStudyRequestConfirmation';
import Mailer from '@/lib/email/Mailer';
import LogTag from '@/lib/log/LogTag';
import StudyRequest from '@/lib/model/StudyRequest';
import StudyRequestComment from '@/lib/model/StudyRequestComment';
import SuccessResponse from '@/lib/model/SuccessResponse';

/**
 * CRUD handling for study requests and related comments.
 *
 * @type {Array<Hapi.ServerRoute>}
 */
const StudyRequestController = [];

// STUDY REQUESTS

/**
 * Create a new study request.  This endpoint also sends an email to the requester
 * and any persons CC'd.
 *
 * The request body should contain the request, including any studies requested
 * therein, in JSON format.
 *
 * @memberof StudyRequestController
 * @name postStudyRequest
 * @type {Hapi.ServerRoute}
 */
StudyRequestController.push({
  method: 'POST',
  path: '/requests/study',
  options: {
    response: {
      schema: StudyRequest.read,
    },
    validate: {
      payload: StudyRequest.create,
    },
  },
  handler: async (request) => {
    const user = request.auth.credentials;
    const { id } = user;
    const studyRequest = await StudyRequestDAO.create({
      userId: id,
      status: 'REQUESTED',
      closed: false,
      ...request.payload,
    });
    const email = new EmailStudyRequestConfirmation(user, studyRequest);
    const emailOptions = await email.getOptions();
    const emailResponse = await Mailer.send(emailOptions);
    request.log(LogTag.DEBUG, emailResponse);
    return studyRequest;
  },
});

/**
 * Get the study request with the given ID.
 *
 * @memberof StudyRequestController
 * @name getStudyRequest
 * @type {Hapi.ServerRoute}
 */
StudyRequestController.push({
  method: 'GET',
  path: '/requests/study/{id}',
  options: {
    response: {
      schema: StudyRequest.read,
    },
    validate: {
      params: {
        id: Joi.number().integer().positive().required(),
      },
    },
  },
  handler: async (request) => {
    const { id } = request.params;
    const studyRequest = await StudyRequestDAO.byId(id);
    if (studyRequest === null) {
      return Boom.notFound(`no study request found with ID ${id}`);
    }
    return studyRequest;
  },
});

/**
 * Returns all requests submitted (i.e. created) by the current user.
 *
 * @memberof StudyRequestController
 * @name getUserStudyRequests
 * @type {Hapi.ServerRoute}
 */
StudyRequestController.push({
  method: 'GET',
  path: '/requests/study',
  options: {
    response: {
      schema: Joi.array().items(StudyRequest.read),
    },
    validate: {
      query: {
        // TODO: remove when we have RBAC
        isSupervisor: Joi.boolean().default(false),
      },
    },
  },
  handler: async (request) => {
    const { isSupervisor } = request.query;
    if (isSupervisor) {
      return StudyRequestDAO.all();
    }
    const user = request.auth.credentials;
    return StudyRequestDAO.byUser(user);
  },
});

/**
 * Update the given study request.
 *
 * The request body should contain the request, including any studies requested
 * therein, in JSON format.  The list of studies for the current request will be
 * updated to match the request body.
 *
 * The ID of the request URI should match the ID of the request in the body.
 *
 * @memberof StudyRequestController
 * @name putStudyRequest
 * @type {Hapi.ServerRoute}
 */
StudyRequestController.push({
  method: 'PUT',
  path: '/requests/study/{id}',
  options: {
    response: {
      schema: StudyRequest.read,
    },
    validate: {
      params: {
        id: Joi.number().integer().positive().required(),
      },
      payload: StudyRequest.update.append({
        // TODO: remove when we have RBAC
        isSupervisor: Joi.boolean().default(false),
      }),
    },
  },
  handler: async (request) => {
    const user = request.auth.credentials;
    const { id } = request.params;
    const { isSupervisor, ...studyRequestNew } = request.payload;

    const studyRequestOld = await StudyRequestDAO.byId(id);
    if (studyRequestOld === null) {
      return Boom.notFound(`no study request found with ID ${id}`);
    }

    if (studyRequestNew.id !== studyRequestOld.id) {
      return Boom.badRequest('cannot change ID for study request');
    }
    if (!studyRequestNew.createdAt.equals(studyRequestOld.createdAt)) {
      return Boom.badRequest('cannot change creation timestamp for study request');
    }
    if (studyRequestNew.userId !== studyRequestOld.userId) {
      return Boom.badRequest('cannot change owner for study request');
    }

    if (studyRequestOld.userId !== user.id && !isSupervisor) {
      return Boom.forbidden('not authorized to change study request owned by another user');
    }
    if (studyRequestNew.assignedTo !== studyRequestOld.assignedTo && !isSupervisor) {
      return Boom.forbidden('not authorized to change assignment for study request');
    }
    if (studyRequestNew.status !== studyRequestOld.status && !isSupervisor) {
      return Boom.forbidden('not authorized to change status for study request');
    }

    return StudyRequestDAO.update(studyRequestNew);
  },
});

/**
 * Delete the study request with the given ID.
 *
 * @memberof StudyRequestController
 * @name deleteStudyRequest
 * @type {Hapi.ServerRoute}
 */
StudyRequestController.push({
  method: 'DELETE',
  path: '/requests/study/{id}',
  options: {
    response: {
      schema: SuccessResponse,
    },
    validate: {
      params: {
        id: Joi.number().integer().positive().required(),
      },
      query: {
        // TODO: remove when we have RBAC
        isSupervisor: Joi.boolean().default(false),
      },
    },
  },
  handler: async (request) => {
    const { id } = request.params;
    const { isSupervisor } = request.query;
    const studyRequest = await StudyRequestDAO.byId(id);
    if (studyRequest === null) {
      return Boom.notFound(`no study request found with ID ${id}`);
    }
    if (!isSupervisor) {
      return Boom.forbidden('cannot delete study request as non-supervisor');
    }
    const success = await StudyRequestDAO.delete(studyRequest);
    if (!success) {
      return Boom.notFound(`could not delete study request with ID ${id}`);
    }
    return { success };
  },
});

// STUDY REQUEST COMMENTS

/**
 * Create a new comment on the given study request.
 *
 * The request body should contain the comment in JSON format, e.g.
 * `{ "comment": "best comment ever~~1" }`.
 *
 * @memberof StudyRequestController
 * @name postStudyRequestComment
 * @type {Hapi.ServerRoute}
 */
StudyRequestController.push({
  method: 'POST',
  path: '/requests/study/{studyRequestId}/comments',
  options: {
    response: {
      schema: StudyRequestComment.read,
    },
    validate: {
      params: {
        studyRequestId: Joi.number().integer().positive().required(),
      },
      payload: StudyRequestComment.create,
    },
  },
  handler: async (request) => {
    const { id: userId } = request.auth.credentials;
    const { studyRequestId } = request.params;
    const studyRequest = await StudyRequestDAO.byId(studyRequestId);
    if (studyRequest === null) {
      return Boom.notFound(`no study request found with ID ${studyRequestId}`);
    }
    return StudyRequestCommentDAO.create(studyRequest, {
      userId,
      ...request.payload,
    });
  },
});

/**
 * Get comments for the given study request.
 *
 * @memberof StudyRequestController
 * @name getStudyRequestComments
 * @type {Hapi.ServerRoute}
 */
StudyRequestController.push({
  method: 'GET',
  path: '/requests/study/{studyRequestId}/comments',
  options: {
    response: {
      schema: Joi.array().items(StudyRequestComment.read),
    },
    validate: {
      params: {
        studyRequestId: Joi.number().integer().positive().required(),
      },
    },
  },
  handler: async (request) => {
    const { studyRequestId } = request.params;
    const studyRequest = await StudyRequestDAO.byId(studyRequestId);
    if (studyRequest === null) {
      return Boom.notFound(`no study request found with ID ${studyRequestId}`);
    }
    return StudyRequestCommentDAO.byStudyRequest(studyRequest);
  },
});

/**
 * Update the given comment on the given study request.
 *
 * The request body should contain the comment.
 *
 * The ID of the request URI should match the ID of the comment in the body.
 *
 * @memberof StudyRequestController
 * @name putStudyRequestComment
 * @type {Hapi.ServerRoute}
 */
StudyRequestController.push({
  method: 'PUT',
  path: '/requests/study/{studyRequestId}/comments/{commentId}',
  options: {
    response: {
      schema: StudyRequestComment.read,
    },
    validate: {
      params: {
        commentId: Joi.number().integer().positive().required(),
        studyRequestId: Joi.number().integer().positive().required(),
      },
      payload: StudyRequestComment.update,
    },
  },
  handler: async (request) => {
    const user = request.auth.credentials;
    const { commentId, studyRequestId } = request.params;
    const commentNew = request.payload;

    const studyRequest = await StudyRequestDAO.byId(studyRequestId);
    if (studyRequest === null) {
      return Boom.notFound(`no study request found with ID ${studyRequestId}`);
    }
    const commentOld = await StudyRequestCommentDAO.byId(commentId);
    if (commentOld.studyRequestId !== studyRequest.id) {
      return Boom.badRequest(
        `no comment with ID ${commentId} for study request ${studyRequestId}`,
      );
    }

    if (commentOld.id !== commentNew.id) {
      return Boom.badRequest('cannot change ID for study request');
    }
    if (!commentOld.createdAt.equals(commentNew.createdAt)) {
      return Boom.badRequest('cannot change creation timestamp for study request');
    }
    if (commentOld.userId !== commentNew.userId) {
      return Boom.badRequest('cannot change owner for study request');
    }
    if (commentOld.studyRequestId !== commentNew.studyRequestId) {
      return Boom.badRequest('cannot change owner for study request');
    }

    if (commentOld.userId !== user.id) {
      return Boom.forbidden('cannot update comment owned by another user');
    }

    return StudyRequestCommentDAO.update(commentNew);
  },
});

/**
 * Delete the given comment on the given study request.
 *
 * @memberof StudyRequestController
 * @name deleteStudyRequestComment
 * @type {Hapi.ServerRoute}
 */
StudyRequestController.push({
  method: 'DELETE',
  path: '/requests/study/{studyRequestId}/comments/{commentId}',
  options: {
    response: {
      schema: SuccessResponse,
    },
    validate: {
      params: {
        commentId: Joi.number().integer().positive().required(),
        studyRequestId: Joi.number().integer().positive().required(),
      },
    },
  },
  handler: async (request) => {
    const user = request.auth.credentials;
    const { commentId, studyRequestId } = request.params;

    const studyRequest = await StudyRequestDAO.byId(studyRequestId);
    if (studyRequest === null) {
      return Boom.notFound(`no study request found with ID ${studyRequestId}`);
    }
    const comment = await StudyRequestCommentDAO.byId(commentId);
    if (comment.studyRequestId !== studyRequest.id) {
      return Boom.badRequest(
        `no comment with ID ${commentId} for study request ${studyRequestId}`,
      );
    }

    if (comment.userId !== user.id) {
      return Boom.forbidden('cannot delete comment owned by another user');
    }
    const success = await StudyRequestCommentDAO.delete(comment);
    if (!success) {
      return Boom.notFound(`could not delete comment with ID ${commentId}`);
    }
    return { success };
  },
});

export default StudyRequestController;
