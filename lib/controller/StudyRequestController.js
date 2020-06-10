import Boom from '@hapi/boom';

import {
  AuthScope,
  CentrelineType,
  StudyRequestStatus,
} from '@/lib/Constants';
import { hasAuthScope } from '@/lib/auth/ScopeMatcher';
import StudyRequestDAO from '@/lib/db/StudyRequestDAO';
import StudyRequestChangeDAO from '@/lib/db/StudyRequestChangeDAO';
import StudyRequestCommentDAO from '@/lib/db/StudyRequestCommentDAO';
import EmailStudyRequestConfirmation from '@/lib/email/EmailStudyRequestConfirmation';
import Mailer from '@/lib/email/Mailer';
import LogTag from '@/lib/log/LogTag';
import Joi from '@/lib/model/Joi';
import StudyRequest from '@/lib/model/StudyRequest';
import StudyRequestChange from '@/lib/model/StudyRequestChange';
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
    const studyRequest = await StudyRequestDAO.create(request.payload, user);
    try {
      const email = new EmailStudyRequestConfirmation(user, studyRequest);
      const emailOptions = await email.getOptions();
      const emailResponse = await Mailer.send(emailOptions);
      request.log(LogTag.DEBUG, emailResponse);
    } catch (err) {
      request.log(LogTag.ERROR, 'EmailStudyRequestConfirmation: failed sending');
    }
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
 * Fetch pending study requests at the given centreline feature.
 *
 * @memberof StudyRequestController
 * @name getStudyRequestsByCentrelinePending
 */
StudyRequestController.push({
  method: 'GET',
  path: '/requests/study/byCentreline/pending',
  options: {
    auth: {
      scope: [AuthScope.STUDY_REQUESTS.name],
    },
    response: {
      schema: Joi.array().items(StudyRequest.read),
    },
    validate: {
      query: {
        centrelineId: Joi.number().integer().positive().required(),
        centrelineType: Joi.number().valid(
          CentrelineType.SEGMENT,
          CentrelineType.INTERSECTION,
        ),
      },
    },
  },
  handler: async (request) => {
    const {
      centrelineId,
      centrelineType,
    } = request.query;
    return StudyRequestDAO.byCentrelinePending(centrelineId, centrelineType);
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
      schema: {
        studyRequest: StudyRequest.read,
        studyRequestChange: StudyRequestChange.read.allow(null),
      },
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

    if (studyRequestNew.status !== studyRequestOld.status
      && !studyRequestOld.status.canTransitionTo(studyRequestNew.status)) {
      return Boom.badRequest(
        `invalid state transition: ${studyRequestOld.status} -> ${studyRequestNew.status}`,
      );
    }

    if (!hasAuthScope(user, AuthScope.STUDY_REQUESTS_ADMIN)) {
      if (studyRequestOld.userId !== user.id) {
        return Boom.forbidden('not authorized to change study request owned by another user');
      }
      if (studyRequestNew.assignedTo !== studyRequestOld.assignedTo) {
        return Boom.forbidden('not authorized to change assignment for study request');
      }
      if (studyRequestNew.status !== studyRequestOld.status
        && studyRequestNew.status !== StudyRequestStatus.CANCELLED
        && studyRequestOld.status !== StudyRequestStatus.CANCELLED) {
        /*
         * Non-admin requesters can only change the status to cancel requests, or to
         * reopen previously cancelled requests.
         */
        return Boom.forbidden('not authorized to change status for study request');
      }
    }

    const tasks = [StudyRequestDAO.update(studyRequestNew, user)];
    if (studyRequestNew.status !== studyRequestOld.status) {
      /*
       * At one point, we had planned to log all changes in `study_request_changes`.
       * This was abandoned in favour of the current "status changes only" approach,
       * which allows us to quickly determine the last time the status was changed
       * to a particular code.
       */
      tasks.push(StudyRequestChangeDAO.create(studyRequestNew, user));
    }
    const [studyRequest, studyRequestChange = null] = await Promise.all(tasks);
    return { studyRequest, studyRequestChange };
  },
});

// STUDY REQUEST CHANGES

/**
 * Get status changes for the given study request.
 *
 * @memberof StudyRequestController
 * @name getStudyRequestChanges
 * @type {Hapi.ServerRoute}
 */
StudyRequestController.push({
  method: 'GET',
  path: '/requests/study/{studyRequestId}/changes',
  options: {
    auth: {
      scope: [AuthScope.STUDY_REQUESTS.name],
    },
    response: {
      schema: Joi.array().items(StudyRequestChange.read),
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
    return StudyRequestChangeDAO.byStudyRequest(studyRequest);
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
      schema: {
        studyRequest: StudyRequest.read,
        studyRequestComment: StudyRequestComment.read,
      },
    },
    validate: {
      params: {
        studyRequestId: Joi.number().integer().positive().required(),
      },
      payload: StudyRequestComment.create,
    },
  },
  handler: async (request) => {
    const user = request.auth.credentials;
    const { studyRequestId } = request.params;
    const studyRequest = await StudyRequestDAO.byId(studyRequestId);
    if (studyRequest === null) {
      return Boom.notFound(`no study request found with ID ${studyRequestId}`);
    }

    // update last edited timestamp
    const [studyRequestUpdated, studyRequestComment] = await Promise.all([
      StudyRequestDAO.update(studyRequest, user),
      StudyRequestCommentDAO.create(request.payload, studyRequest, user),
    ]);
    return {
      studyRequest: studyRequestUpdated,
      studyRequestComment,
    };
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
      schema: {
        studyRequest: StudyRequest.read,
        studyRequestComment: StudyRequestComment.read,
      },
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

    // update last edited timestamp
    const [studyRequestUpdated, studyRequestComment] = await Promise.all([
      StudyRequestDAO.update(studyRequest, user),
      StudyRequestCommentDAO.update(commentNew),
    ]);
    return {
      studyRequest: studyRequestUpdated,
      studyRequestComment,
    };
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
      schema: {
        studyRequest: StudyRequest.read,
        studyRequestComment: SuccessResponse,
      },
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
    const [studyRequestUpdated, success] = await Promise.all([
      StudyRequestDAO.update(studyRequest, user),
      StudyRequestCommentDAO.delete(comment),
    ]);
    if (!success) {
      return Boom.notFound(`could not delete comment with ID ${commentId}`);
    }
    return {
      studyRequest: studyRequestUpdated,
      studyRequestComment: { success },
    };
  },
});

export default StudyRequestController;
