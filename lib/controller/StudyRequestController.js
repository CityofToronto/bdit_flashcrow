import Boom from '@hapi/boom';

import { AuthScope, StudyRequestStatus } from '@/lib/Constants';
import { hasAuthScope } from '@/lib/auth/ScopeMatcher';
import StudyRequestDAO from '@/lib/db/StudyRequestDAO';
import StudyRequestCommentDAO from '@/lib/db/StudyRequestCommentDAO';
import EmailStudyRequestConfirmation from '@/lib/email/EmailStudyRequestConfirmation';
import Mailer from '@/lib/email/Mailer';
import LogTag from '@/lib/log/LogTag';
import Joi from '@/lib/model/Joi';
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
    auth: {
      scope: [AuthScope.STUDY_REQUESTS_EDIT.name],
    },
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
      status: StudyRequestStatus.REQUESTED,
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
    auth: {
      scope: [AuthScope.STUDY_REQUESTS.name],
    },
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
 * Returns all requests visible to the current user.  Some users can only view requests they
 * submitted, while others can view requests submitted by them and their direct reports, and
 * yet others can view all submitted requests.
 *
 * @memberof StudyRequestController
 * @name getStudyRequests
 * @type {Hapi.ServerRoute}
 */
StudyRequestController.push({
  method: 'GET',
  path: '/requests/study',
  options: {
    auth: {
      scope: [AuthScope.STUDY_REQUESTS.name],
    },
    response: {
      schema: Joi.array().items(StudyRequest.read),
    },
  },
  // TODO: filtering
  handler: async () => StudyRequestDAO.all(),
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
    auth: {
      scope: [AuthScope.STUDY_REQUESTS_EDIT.name],
    },
    response: {
      schema: StudyRequest.read,
    },
    validate: {
      params: {
        id: Joi.number().integer().positive().required(),
      },
      payload: StudyRequest.update,
    },
  },
  handler: async (request) => {
    const user = request.auth.credentials;
    const { id } = request.params;
    const studyRequestNew = request.payload;

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
    if (studyRequestNew.lastEditorId !== studyRequestOld.lastEditorId) {
      return Boom.badRequest('cannot change last editor for study request');
    }
    if (studyRequestNew.lastEditedAt === null) {
      if (studyRequestOld.lastEditedAt !== null) {
        return Boom.badRequest('cannot change last edit timestamp for study request');
      }
    } else if (!studyRequestNew.lastEditedAt.equals(studyRequestOld.lastEditedAt)) {
      return Boom.badRequest('cannot change last edit timestamp for study request');
    }

    if (!hasAuthScope(user, AuthScope.STUDY_REQUESTS_ADMIN)) {
      if (studyRequestOld.userId !== user.id) {
        return Boom.forbidden('not authorized to change study request owned by another user');
      }
      if (studyRequestNew.assignedTo !== studyRequestOld.assignedTo) {
        return Boom.forbidden('not authorized to change assignment for study request');
      }
      // TODO: the requester *can* change the status to CANCELLED!
      if (studyRequestNew.status !== studyRequestOld.status) {
        return Boom.forbidden('not authorized to change status for study request');
      }
    }

    return StudyRequestDAO.update(studyRequestNew, user);
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
    auth: {
      scope: [AuthScope.STUDY_REQUESTS.name],
    },
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
    auth: {
      scope: [AuthScope.STUDY_REQUESTS.name],
    },
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
    auth: {
      scope: [AuthScope.STUDY_REQUESTS.name],
    },
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
    auth: {
      scope: [AuthScope.STUDY_REQUESTS.name],
    },
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
