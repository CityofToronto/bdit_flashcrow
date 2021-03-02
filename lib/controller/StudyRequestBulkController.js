import Boom from '@hapi/boom';

import { canUpdateStudyRequestBulk } from '@/lib/auth/StudyRequestPermissions';
import { AuthScope, LocationSelectionType } from '@/lib/Constants';
import StudyRequestBulkDAO from '@/lib/db/StudyRequestBulkDAO';
import StudyRequestChangeDAO from '@/lib/db/StudyRequestChangeDAO';
import EmailStudyRequestBulkRequested from '@/lib/email/EmailStudyRequestBulkRequested';
import EmailStudyRequestBulkRequestedAdmin from '@/lib/email/EmailStudyRequestBulkRequestedAdmin';
import {
  getStudyRequestBulkUpdateEmails,
  sendEmailsSafe,
} from '@/lib/email/MailUtils';
import Joi from '@/lib/model/Joi';
import StudyRequestBulk from '@/lib/model/StudyRequestBulk';
import StudyRequestChange from '@/lib/model/StudyRequestChange';
import CentrelineSelection from '@/lib/model/helpers/CentrelineSelection';

/**
 * CRUD handling for bulk study requests, including actions that affect all
 * sub-requests.
 *
 * Note that, in MOVE's permissions model, all users with `STUDY_REQUESTS` scope have read
 * access to all study requests.  This is by design: it helps staff coordinate around
 * each others' requests, and it builds divisional awareness of work in progress.
 *
 * @type {Array<Hapi.ServerRoute>}
 */
const StudyRequestBulkController = [];

/**
 * Create a new bulk study request.
 *
 * This endpoint also sends an email to the requester and any persons CC'd.  Note that this
 * email is sent after the bulk study request is created: since email delivery is not 100%
 * reliable, and since this depends on AWS SES (which is also not 100% reliable), it is not
 * guaranteed that this email will arrive successfully.
 *
 * The request body should contain the bulk request, including any studies requested
 * therein, in JSON format.
 *
 * @memberof StudyRequestBulkController
 * @name postStudyRequestBulk
 * @type {Hapi.ServerRoute}
 */
StudyRequestBulkController.push({
  method: 'POST',
  path: '/requests/study/bulk',
  options: {
    auth: {
      scope: [AuthScope.STUDY_REQUESTS.name],
    },
    description: 'Create a new bulk study request',
    response: {
      schema: StudyRequestBulk.read,
    },
    tags: ['api'],
    validate: {
      payload: StudyRequestBulk.create,
    },
  },
  handler: async (request) => {
    const user = request.auth.credentials;
    const studyRequestBulk = await StudyRequestBulkDAO.create(request.payload, user);

    const emailRequestedAdmin = new EmailStudyRequestBulkRequestedAdmin(studyRequestBulk);
    const emailRequested = new EmailStudyRequestBulkRequested(studyRequestBulk);
    await sendEmailsSafe(request, [emailRequestedAdmin, emailRequested]);

    return studyRequestBulk;
  },
});

/**
 * Get the bulk study request with the given ID.
 *
 * @memberof StudyRequestBulkController
 * @name getStudyRequestBulk
 * @type {Hapi.ServerRoute}
 */
StudyRequestBulkController.push({
  method: 'GET',
  path: '/requests/study/bulk/{id}',
  options: {
    auth: {
      scope: [AuthScope.STUDY_REQUESTS.name],
    },
    description: 'Get the given bulk study request',
    response: {
      schema: StudyRequestBulk.read,
    },
    validate: {
      params: {
        id: Joi.number().integer().positive().required(),
      },
    },
  },
  handler: async (request) => {
    const { id } = request.params;
    const studyRequestBulk = await StudyRequestBulkDAO.byId(id);
    if (studyRequestBulk === null) {
      return Boom.notFound(`no bulk study request found with ID ${id}`);
    }
    return studyRequestBulk;
  },
});

/**
 * Get the name of the bulk study request with the given ID.  This is intended for flows
 * like View Request (non-bulk), where we need to show the bulk request name in the
 * interface but don't need the entire set of study requests, associated locations,
 * etc. that a complete bulk study request fetch would entail.
 *
 * @memberof StudyRequestBulkController
 * @name getStudyRequestBulkName
 * @type {Hapi.ServerRoute}
 */
StudyRequestBulkController.push({
  method: 'GET',
  path: '/requests/study/bulk/{id}/name',
  options: {
    auth: {
      scope: [AuthScope.STUDY_REQUESTS.name],
    },
    description: 'Get the name of the given bulk study request',
    response: {
      schema: {
        name: Joi.string().required(),
      },
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
    const name = await StudyRequestBulkDAO.nameById(id);
    if (name === null) {
      return Boom.notFound(`no bulk study request found with ID ${id}`);
    }
    return { name };
  },
});

/**
 * Fetch pending bulk study requests at the given centreline selection.
 *
 * A bulk request is "pending" if it contains at least one request that is not closed.
 *
 * Note that, unlike many endpoints that take location selection parameters, this one uses
 * both a {@link CompositeId} and the `selectionType`.  These are matched directly against
 * the same fields in the bulk study request.
 *
 * @memberof StudyRequestBulkController
 * @name getStudyRequestsBulkByLocationsSelectionPending
 */
StudyRequestBulkController.push({
  method: 'GET',
  path: '/requests/study/bulk/byLocationsSelection/pending',
  options: {
    auth: {
      scope: [AuthScope.STUDY_REQUESTS.name],
    },
    description: 'Get all pending bulk study requests at the given location(s)',
    response: {
      schema: Joi.array().items(StudyRequestBulk.read),
    },
    tags: ['api'],
    validate: {
      query: {
        ...CentrelineSelection,
        selectionType: Joi.enum().ofType(LocationSelectionType),
      },
    },
  },
  handler: async (request) => {
    const { s1, selectionType } = request.query;
    const locationsSelection = { s1, selectionType };
    return StudyRequestBulkDAO.byLocationsSelectionPending(locationsSelection);
  },
});

/**
 * Update the given bulk study request.
 *
 * The request body both identifies the bulk request to be updated (via `id`, which must
 * match the request URL parameter of the same name) and provides the desired post-update
 * state of that bulk request.
 *
 * Note that you cannot use this endpoint to remove requests from, or add requests to, a bulk
 * request.  You can, however, use it to update existing requests.  This is deliberate: changing
 * the set of requests associated with a bulk request mid-fulfillment introduces a *lot* of
 * complexity.
 *
 * HTTP 400 if updating the given bulk request to the given payload would change a non-updatable
 * field, add or remove requests, or result in an invalid transition between study request
 * statuses (e.g. `REQUESTED` to `COMPLETED`: it must go through `ASSIGNED` first!)
 *
 * HTTP 403 if the user does not have `STUDY_REQUESTS_ADMIN` scope and attempts to modify a
 * request owned by another user, assign a request for fulfillment, or change the status of the
 * request in any other way than to cancel or un-cancel it.
 *
 * @memberof StudyRequestBulkController
 * @name putStudyRequestBulk
 * @type {Hapi.ServerRoute}
 */
StudyRequestBulkController.push({
  method: 'PUT',
  path: '/requests/study/bulk/{id}',
  options: {
    auth: {
      scope: [AuthScope.STUDY_REQUESTS.name],
    },
    description: 'Update the given bulk study request',
    response: {
      schema: StudyRequestBulk.read,
    },
    tags: ['api'],
    validate: {
      params: {
        id: Joi.number().integer().positive().required(),
      },
      payload: StudyRequestBulk.update,
    },
  },
  handler: async (request) => {
    const user = request.auth.credentials;
    const { id } = request.params;
    const studyRequestBulkNew = request.payload;

    const studyRequestBulkOld = await StudyRequestBulkDAO.byId(id);
    if (studyRequestBulkOld === null) {
      return Boom.notFound(`no bulk study request found with ID ${id}`);
    }
    const err = canUpdateStudyRequestBulk(studyRequestBulkNew, studyRequestBulkOld, user);
    if (err !== null) {
      return err;
    }

    const tasks = [
      StudyRequestBulkDAO.update(studyRequestBulkNew, user),
    ];
    const n = studyRequestBulkNew.studyRequests.length;
    for (let i = 0; i < n; i++) {
      const studyRequestNew = studyRequestBulkNew.studyRequests[i];
      const studyRequestOld = studyRequestBulkOld.studyRequests[i];
      if (studyRequestNew.status !== studyRequestOld.status) {
        tasks.push(StudyRequestChangeDAO.create(studyRequestNew, user));
      }
    }
    const [studyRequestBulk] = await Promise.all(tasks);

    const emails = await getStudyRequestBulkUpdateEmails(
      studyRequestBulkNew,
      studyRequestBulkOld,
    );
    await sendEmailsSafe(request, emails);

    return studyRequestBulk;
  },
});

// STUDY REQUEST CHANGES

/**
 * Get status changes for all requests that are part of the given bulk study request.
 * See {@link StudyRequestController.getStudyRequestChanges} for more details.
 *
 * @memberof StudyRequestBulkController
 * @name getStudyRequestBulkChanges
 * @type {Hapi.ServerRoute}
 */
StudyRequestBulkController.push({
  method: 'GET',
  path: '/requests/study/bulk/{id}/changes',
  options: {
    auth: {
      scope: [AuthScope.STUDY_REQUESTS.name],
    },
    description: 'Get all status changes for the given bulk study request',
    response: {
      schema: Joi.array().items(StudyRequestChange.read),
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
    const studyRequestBulk = await StudyRequestBulkDAO.byId(id);
    if (studyRequestBulk === null) {
      return Boom.notFound(`no bulk study request found with ID ${id}`);
    }
    return StudyRequestChangeDAO.byStudyRequestBulk(studyRequestBulk);
  },
});

export default StudyRequestBulkController;
