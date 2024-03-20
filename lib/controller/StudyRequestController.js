import Boom from '@hapi/boom';

import { AuthScope } from '@/lib/Constants';
import { mapBy } from '@/lib/MapUtils';
import { canUpdateStudyRequest } from '@/lib/auth/StudyRequestPermissions';
import StudyRequestDAO from '@/lib/db/StudyRequestDAO';
import StudyRequestBulkDAO from '@/lib/db/StudyRequestBulkDAO';
import StudyRequestChangeDAO from '@/lib/db/StudyRequestChangeDAO';
import StudyRequestCommentDAO from '@/lib/db/StudyRequestCommentDAO';
import StudyRequestItemDAO from '@/lib/db/StudyRequestItemDAO';
import EmailStudyRequestNewComment from '@/lib/email/EmailStudyRequestNewComment';
import EmailStudyRequestRequested from '@/lib/email/EmailStudyRequestRequested';
import EmailStudyRequestRequestedAdmin from '@/lib/email/EmailStudyRequestRequestedAdmin';
import {
  getStudyRequestUpdateEmailsDeep,
  sendEmailSafe,
  sendEmailsSafe,
} from '@/lib/email/MailUtils';
import CompositeId from '@/lib/io/CompositeId';
import Joi from '@/lib/model/Joi';
import StudyRequest from '@/lib/model/StudyRequest';
import StudyRequestBulk from '@/lib/model/StudyRequestBulk';
import StudyRequestChange from '@/lib/model/StudyRequestChange';
import StudyRequestComment from '@/lib/model/StudyRequestComment';
import StudyRequestFilters from '@/lib/model/StudyRequestFilters';
import SuccessResponse from '@/lib/model/SuccessResponse';
import CentrelineSelection from '@/lib/model/helpers/CentrelineSelection';

/**
 * CRUD handling for study requests and related comments.
 *
 * Note that, in MOVE's permissions model, all users with `STUDY_REQUESTS` scope have read
 * access to all study requests.  This is by design: it helps staff coordinate around
 * each others' requests, and it builds divisional awareness of work in progress.
 *
 * @type {Array<Hapi.ServerRoute>}
 */
const StudyRequestController = [];

// STUDY REQUESTS

/**
 * Create a new study request.
 *
 * This endpoint also sends an email to the requester and any persons CC'd.  Note that this
 * email is sent after the bulk study request is created: since email delivery is not 100%
 * reliable, and since this depends on AWS SES (which is also not 100% reliable), it is not
 * guaranteed that this email will arrive successfully.
 *
 * The request body should contain the request in JSON format.
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
      scope: [AuthScope.STUDY_REQUESTS.name],
    },
    description: 'Create a new study request',
    response: {
      schema: StudyRequest.read,
    },
    tags: ['api'],
    validate: {
      payload: StudyRequest.create,
    },
  },
  handler: async (request) => {
    const user = request.auth.credentials;
    const studyRequest = await StudyRequestDAO.create(request.payload, user);

    const emailRequestedAdmin = new EmailStudyRequestRequestedAdmin(studyRequest);
    const emailRequested = new EmailStudyRequestRequested(studyRequest);
    await sendEmailsSafe(request, [emailRequestedAdmin, emailRequested]);

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
    description: 'Get the given study request',
    response: {
      schema: StudyRequest.read,
    },
    tags: ['api'],
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
 * Fetch study requests at the given centreline features that are neither COMPLETED or CANCELLED.
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
    description: 'Get all pending study requests at the given location(s)',
    response: {
      schema: Joi.array().items(StudyRequest.read),
    },
    tags: ['api'],
    validate: {
      query: CentrelineSelection,
    },
  },
  handler: async (request) => {
    const { s1 } = request.query;
    const features = CompositeId.decode(s1);
    return StudyRequestDAO.byCentrelinePending(features);
  },
});

/**
 * Returns paginated study request items, suitable for use in `FcDataTableRequests`.
 *
 * @memberof StudyRequestController
 * @name getStudyRequestItems
 * @type {Hapi.ServerRoute}
 */
StudyRequestController.push({
  method: 'GET',
  path: '/requests/study/items',
  options: {
    auth: {
      scope: [AuthScope.STUDY_REQUESTS.name],
    },
    description: 'Get paginated study request items (both bulk and non-bulk)',
    response: {
      schema: Joi.array().items(
        Joi.object().keys({
          bulk: Joi.boolean().required(),
          request: Joi.when(
            'bulk',
            {
              is: true,
              then: StudyRequestBulk.read.required(),
              otherwise: StudyRequest.read.required(),
            },
          ),
        }),
      ),
    },
    tags: ['api'],
    validate: {
      query: StudyRequestFilters,
    },
  },
  handler: async (request) => {
    const studyRequestQuery = request.query;
    const user = request.auth.credentials;
    const itemKeys = await StudyRequestItemDAO.byQuery(studyRequestQuery, user);

    /*
     * Normally we'd do the following right within `StudyRequestItemDAO`, but that would
     * introduce a circular dependency with `StudyRequestDAO` / `StudyRequestBulkDAO`.  To
     * avoid that for now, we've just inlined all of this post-processing here.
     */
    const studyRequestIds = [];
    const studyRequestBulkIds = [];
    itemKeys.forEach(({ bulk, id }) => {
      if (bulk) {
        studyRequestBulkIds.push(id);
      } else {
        studyRequestIds.push(id);
      }
    });

    const [studyRequests, studyRequestsBulk] = await Promise.all([
      StudyRequestDAO.byIds(studyRequestIds),
      StudyRequestBulkDAO.byIds(studyRequestBulkIds),
    ]);
    const studyRequestsById = mapBy(studyRequests, ({ id }) => id);
    const studyRequestsBulkById = mapBy(studyRequestsBulk, ({ id }) => id);

    return itemKeys.map(({ bulk, id }) => {
      const itemRequest = bulk ? studyRequestsBulkById.get(id) : studyRequestsById.get(id);
      return { bulk, request: itemRequest };
    });
  },
});

/**
 * Fetch total number of requests matching the given study request query.  This value is
 * used to determine the total number of pages when Track Requests is first loaded.
 *
 * @memberof StudyRequestController
 * @name getStudyRequestItemsTotal
 * @type {Hapi.ServerRoute}
 */
StudyRequestController.push({
  method: 'GET',
  path: '/requests/study/items/total',
  options: {
    auth: {
      scope: [AuthScope.STUDY_REQUESTS.name],
    },
    description: 'Get total number of matching requests (both bulk and non-bulk)',
    response: {
      schema: {
        total: Joi.number().integer().min(0).required(),
      },
    },
    tags: ['api'],
    validate: {
      query: StudyRequestFilters,
    },
  },
  handler: async (request) => {
    const studyRequestQuery = request.query;
    const user = request.auth.credentials;
    const total = await StudyRequestItemDAO.byQueryTotal(studyRequestQuery, user);
    return { total };
  },
});

/**
 * Reaggregate all fields for all request_study_items that represent projects.
 *
 * @memberof StudyRequestController
 * @name putStudyRequestItems
 * @type {Hapi.ServerRoute}
 */
StudyRequestController.push({
  method: 'PUT',
  path: '/requests/study/items',
  options: {
    auth: {
      scope: [AuthScope.ADMIN.name],
    },
    description: 'Reaggregate all fields for all request_study_items that represent projects',
    tags: ['api'],
  },
  handler: async () => {
    const allSrbs = await StudyRequestBulkDAO.all();
    const allSrbIds = allSrbs.map(srb => srb.id);

    await StudyRequestItemDAO.upsertByStudyRequestBulkIds(allSrbIds);
    return { success: true };
  },
});

/**
 * Update the given study request.
 *
 * The request body both identifies the request to be updated (via `id`, which must
 * match the request URL parameter of the same name) and provides the desired post-update
 * state of that request.
 *
 * HTTP 400 if updating the given request to the given payload would change a non-updatable
 * field or result in an invalid transition between study request statuses (e.g. `REQUESTED`
 * to `COMPLETED`: it must go through `ASSIGNED` first!)
 *
 * HTTP 403 if the user does not have `STUDY_REQUESTS_ADMIN` scope and attempts to modify a
 * request owned by another user, assign a request for fulfillment, or change the status of the
 * request in any other way than to cancel or un-cancel it.
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
      scope: [AuthScope.STUDY_REQUESTS.name],
    },
    description: 'Update the given study request',
    response: {
      schema: StudyRequest.read,
    },
    tags: ['api'],
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
    // eslint-disable-next-line no-console
    console.log('studyRequestNew:', studyRequestNew);
    // eslint-disable-next-line no-console
    console.log('studyRequestOld:', studyRequestOld);
    if (studyRequestOld === null) {
      return Boom.notFound(`no study request found with ID ${id}`);
    }
    const err = canUpdateStudyRequest(studyRequestNew, studyRequestOld, user);
    if (err !== null) {
      return err;
    }

    const tasks = [
      StudyRequestDAO.update(studyRequestNew),
    ];
    if (studyRequestNew.status !== studyRequestOld.status) {
      /*
       * At one point, we had planned to log all changes in `study_request_changes`.
       * This was abandoned in favour of the current "status changes only" approach,
       * which allows us to quickly determine the last time the status was changed
       * to a particular code.
       */
      tasks.push(StudyRequestChangeDAO.create(studyRequestNew, user));
    }
    const [studyRequest] = await Promise.all(tasks);

    const emails = await getStudyRequestUpdateEmailsDeep(studyRequestNew, studyRequestOld);
    await sendEmailsSafe(request, emails);

    return studyRequest;
  },
});

// STUDY REQUEST CHANGES

/**
 * Get status changes for the given study request.
 *
 * Note that this does not include the initial `REQUESTED` status; only changes made after bulk
 * request creation are recorded.  However, it is possible for this to contain changes into
 * `REQUESTED` status (e.g. if the request was `CANCELLED` and then resumed).
 *
 * Note that this also means the response may contain multiple changes into the same status
 * (e.g. if the request was repeatedly `ASSIGNED` and then unassigned again).
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
    description: 'Get all status changes for the given study request',
    response: {
      schema: Joi.array().items(StudyRequestChange.read),
    },
    tags: ['api'],
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
 * Returns both the study request and the comment.
 *
 * Note that any user with `STUDY_REQUESTS` scope may comment on any study request.
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
    description: 'Create a new comment on the given study request',
    response: {
      schema: {
        studyRequest: StudyRequest.read,
        studyRequestComment: StudyRequestComment.read,
      },
    },
    tags: ['api'],
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
      StudyRequestDAO.update(studyRequest),
      StudyRequestCommentDAO.create(request.payload, studyRequest, user),
    ]);

    const emailNewComment = new EmailStudyRequestNewComment(
      studyRequestUpdated,
      studyRequestComment,
    );
    await sendEmailSafe(request, emailNewComment);

    return {
      studyRequest: studyRequestUpdated,
      studyRequestComment,
    };
  },
});

/**
 * Get comments for the given study request.
 *
 * Note that any user with `STUDY_REQUESTS` scope can read comments for any study request.
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
    description: 'Get all comments on the given study request',
    response: {
      schema: Joi.array().items(StudyRequestComment.read),
    },
    tags: ['api'],
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
 * The request body should contain the comment, and the ID of the request URI
 * should match the ID of the comment in the body.
 *
 * Note that any user with `STUDY_REQUESTS` scope may comment on any request.
 * However, users may not update comments submitted by other users, even if they
 * have `STUDY_REQUESTS_ADMIN` scope.
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
    description: 'Update the given comment on the given study request',
    response: {
      schema: {
        studyRequest: StudyRequest.read,
        studyRequestComment: StudyRequestComment.read,
      },
    },
    tags: ['api'],
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
      return Boom.badRequest('cannot change ID for comment');
    }
    if (!commentOld.createdAt.equals(commentNew.createdAt)) {
      return Boom.badRequest('cannot change creation timestamp for comment');
    }
    if (commentOld.userId !== commentNew.userId) {
      return Boom.badRequest('cannot change owner for comment');
    }
    if (commentOld.studyRequestId !== commentNew.studyRequestId) {
      return Boom.badRequest('cannot change study request for comment');
    }

    if (commentOld.userId !== user.id) {
      return Boom.forbidden('cannot update comment owned by another user');
    }

    // update last edited timestamp
    const [studyRequestUpdated, studyRequestComment] = await Promise.all([
      StudyRequestDAO.update(studyRequest),
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
 * Note that any user with `STUDY_REQUESTS` scope may comment on any request.
 * However, users may not delete comments submitted by other users, even if they
 * have `STUDY_REQUESTS_ADMIN` scope.
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
    description: 'Delete the given comment on the given study request',
    response: {
      schema: {
        studyRequest: StudyRequest.read,
        studyRequestComment: SuccessResponse,
      },
    },
    tags: ['api'],
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
    if (comment === null) {
      return Boom.notFound(`no comment found with ID ${commentId}`);
    }
    if (comment.studyRequestId !== studyRequest.id) {
      return Boom.badRequest(
        `no comment with ID ${commentId} for study request ${studyRequestId}`,
      );
    }

    if (comment.userId !== user.id) {
      return Boom.forbidden('cannot delete comment owned by another user');
    }
    const [studyRequestUpdated, success] = await Promise.all([
      StudyRequestDAO.update(studyRequest),
      StudyRequestCommentDAO.delete(comment),
    ]);
    return {
      studyRequest: studyRequestUpdated,
      studyRequestComment: { success },
    };
  },
});

export default StudyRequestController;
