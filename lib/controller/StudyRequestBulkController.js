import Boom from '@hapi/boom';

import { canUpdateStudyRequestBulk } from '@/lib/auth/StudyRequestPermissions';
import { AuthScope } from '@/lib/Constants';
import StudyRequestDAO from '@/lib/db/StudyRequestDAO';
import StudyRequestBulkDAO from '@/lib/db/StudyRequestBulkDAO';
import StudyRequestChangeDAO from '@/lib/db/StudyRequestChangeDAO';
import EmailStudyRequestBulkRequested from '@/lib/email/EmailStudyRequestBulkRequested';
import EmailStudyRequestBulkRequestedAdmin from '@/lib/email/EmailStudyRequestBulkRequestedAdmin';
import {
  getStudyRequestBulkUpdateEmailsDeep,
  sendEmailsSafe,
} from '@/lib/email/MailUtils';
import Joi from '@/lib/model/Joi';
import StudyRequest from '@/lib/model/StudyRequest';
import StudyRequestBulk from '@/lib/model/StudyRequestBulk';
import StudyRequestChange from '@/lib/model/StudyRequestChange';
import SuccessResponse from '@/lib/model/SuccessResponse';

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
 * Create a new bulk study request from the study requests with the given IDs.
 *
 * This endpoint also sends an email to the requester and any persons CC'd.  Note that this
 * email is sent after the bulk study request is created: since email delivery is not 100%
 * reliable, and since this depends on AWS SES (which is also not 100% reliable), it is not
 * guaranteed that this email will arrive successfully.
 *
 * @memberof StudyRequestBulkController
 * @name postStudyRequestBulkFromRequests
 * @type {Hapi.ServerRoute}
 */
StudyRequestBulkController.push({
  method: 'POST',
  path: '/requests/study/bulk/fromRequests',
  options: {
    auth: {
      scope: [AuthScope.STUDY_REQUESTS.name],
    },
    description: 'Create a new bulk study request from the given study requests',
    response: {
      schema: StudyRequestBulk.read,
    },
    tags: ['api'],
    validate: {
      payload: {
        studyRequestBulk: StudyRequestBulk.create,
        studyRequestIds: Joi.array().single().items(
          Joi.number().integer().positive().required(),
        ).required(),
      },
    },
  },
  handler: async (request) => {
    const { studyRequestBulk, studyRequestIds } = request.payload;
    const studyRequests = await StudyRequestDAO.byIds(studyRequestIds);

    studyRequestBulk.studyRequests = [];
    const user = request.auth.credentials;
    let persistedStudyRequestBulk = await StudyRequestBulkDAO.create(studyRequestBulk, user);
    persistedStudyRequestBulk = await StudyRequestBulkDAO.setStudyRequestBulk(
      studyRequests,
      persistedStudyRequestBulk,
    );

    const emailRequestedAdmin = new EmailStudyRequestBulkRequestedAdmin(persistedStudyRequestBulk);
    const emailRequested = new EmailStudyRequestBulkRequested(persistedStudyRequestBulk);
    await sendEmailsSafe(request, [emailRequestedAdmin, emailRequested]);

    return persistedStudyRequestBulk;
  },
});

/**
 * Create a new bulk study request from the study requests with the given IDs.
 *
 * This endpoint also sends an email to the requester and any persons CC'd.  Note that this
 * email is sent after the bulk study request is created: since email delivery is not 100%
 * reliable, and since this depends on AWS SES (which is also not 100% reliable), it is not
 * guaranteed that this email will arrive successfully.
 *
 * @memberof StudyRequestBulkController
 * @name postStudyRequestBulkRequests
 * @type {Hapi.ServerRoute}
 */
StudyRequestBulkController.push({
  method: 'POST',
  path: '/requests/study/bulk/{id}/requests',
  options: {
    auth: {
      scope: [AuthScope.STUDY_REQUESTS.name],
    },
    description: 'Create new study requests and add them to the given project',
    response: {
      schema: StudyRequestBulk.read,
    },
    tags: ['api'],
    validate: {
      payload: {
        studyRequests: Joi.array().single().items(
          StudyRequest.create,
        ),
      },
    },
  },
  handler: async (request) => {
    const { id } = request.params;
    const studyRequestBulk = await StudyRequestBulkDAO.byId(id);
    if (studyRequestBulk === null) {
      return Boom.notFound(`no bulk study request found with ID ${id}`);
    }

    const user = request.auth.credentials;
    const { studyRequests } = request.payload;
    const persistedStudyRequests = [];
    const n = studyRequests.length;
    for (let i = 0; i < n; i++) {
      const studyRequest = studyRequests[i];
      /* eslint-disable-next-line no-await-in-loop */
      const persistedStudyRequest = await StudyRequestDAO.create(studyRequest, user);
      persistedStudyRequests.push(persistedStudyRequest);
    }

    const persistedStudyRequestBulk = await StudyRequestBulkDAO.setStudyRequestBulk(
      persistedStudyRequests,
      studyRequestBulk,
    );

    const emailRequestedAdmin = new EmailStudyRequestBulkRequestedAdmin(persistedStudyRequestBulk);
    const emailRequested = new EmailStudyRequestBulkRequested(persistedStudyRequestBulk);
    await sendEmailsSafe(request, [emailRequestedAdmin, emailRequested]);

    return persistedStudyRequestBulk;
  },
});

/**
 * Suggests projects to match the autocomplete query `q`.  This fetches exact and prefix
 * matches; the behaviour is similar to the search bar in Track Requests, but only on
 * projects.
 *
 * Returns an array of projects matching the query, up to `limit`.
 *
 * If no such projects exist, returns an empty array.
 *
 * @memberof StudyRequestBulkController
 * @name getStudyRequestsBulkSuggest
 * @type {Hapi.ServerRoute}
 */
StudyRequestBulkController.push({
  method: 'GET',
  path: '/requests/study/bulk/suggest',
  options: {
    auth: {
      scope: [AuthScope.STUDY_REQUESTS.name],
    },
    description: 'Get projects matching an autocomplete query',
    response: {
      schema: Joi.array().items(StudyRequestBulk.read),
    },
    tags: ['api'],
    validate: {
      query: {
        limit: Joi
          .number()
          .integer()
          .positive()
          .max(100)
          .required(),
        q: Joi.string().min(3).required(),
      },
    },
  },
  handler: async (request) => {
    const { limit, q } = request.query;
    return StudyRequestBulkDAO.nameSuggestions(q, limit);
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
      StudyRequestBulkDAO.update(studyRequestBulkNew),
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

    const emails = await getStudyRequestBulkUpdateEmailsDeep(
      studyRequestBulkNew,
      studyRequestBulkOld,
    );
    await sendEmailsSafe(request, emails);

    return studyRequestBulk;
  },
});

/**
 * Moves the given study requests into the given bulk study request.
 *
 * @memberof StudyRequestBulkController
 * @name putStudyRequestBulkRequests
 * @type {Hapi.ServerRoute}
 */
StudyRequestBulkController.push({
  method: 'PUT',
  path: '/requests/study/bulk/{id}/requests',
  options: {
    auth: {
      scope: [AuthScope.STUDY_REQUESTS.name],
    },
    description: 'Moves the given study requests into the given bulk study request',
    response: {
      schema: StudyRequestBulk.read,
    },
    tags: ['api'],
    validate: {
      payload: {
        studyRequestIds: Joi.array().single().items(
          Joi.number().integer().positive().required(),
        ).required(),
      },
    },
  },
  handler: async (request) => {
    const { id } = request.params;
    const studyRequestBulk = await StudyRequestBulkDAO.byId(id);
    if (studyRequestBulk === null) {
      return Boom.notFound(`no bulk study request found with ID ${id}`);
    }

    const { studyRequestIds } = request.payload;
    const studyRequests = await StudyRequestDAO.byIds(studyRequestIds);
    return StudyRequestBulkDAO.setStudyRequestBulk(studyRequests, studyRequestBulk);
  },
});

/**
 * Removes the given study requests from any bulk study request(s) they are a part
 * of.
 *
 * @memberof StudyRequestBulkController
 * @name deleteStudyRequestBulkRequests
 * @type {Hapi.ServerRoute}
 */
StudyRequestBulkController.push({
  method: 'DELETE',
  path: '/requests/study/bulk/requests',
  options: {
    auth: {
      scope: [AuthScope.STUDY_REQUESTS.name],
    },
    description: 'Removes the given study requests from their bulk requests',
    response: {
      schema: SuccessResponse,
    },
    tags: ['api'],
    validate: {
      payload: {
        studyRequestIds: Joi.array().single().items(
          Joi.number().integer().positive().required(),
        ).required(),
      },
    },
  },
  handler: async (request) => {
    const { studyRequestIds } = request.payload;
    const studyRequests = await StudyRequestDAO.byIds(studyRequestIds);
    await StudyRequestBulkDAO.setStudyRequestBulk(studyRequests, null);
    return { success: true };
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
