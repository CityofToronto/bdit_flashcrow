import Boom from '@hapi/boom';
import Joi from '@hapi/joi';

import StudyRequestDAO from '@/lib/db/StudyRequestDAO';
import EmailStudyRequestConfirmation from '@/lib/email/EmailStudyRequestConfirmation';
import Mailer from '@/lib/email/Mailer';
import LogTag from '@/lib/log/LogTag';
import StudyRequest from '@/lib/model/StudyRequest';
import SuccessResponse from '@/lib/model/SuccessResponse';

/**
 * CRUD handling for study requests.
 *
 * @type {Array<Hapi.ServerRoute>}
 */
const StudyRequestController = [];

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
      payload: StudyRequest.transient,
    },
  },
  handler: async (request) => {
    const user = request.auth.credentials;
    const { subject } = user;
    const studyRequest = await StudyRequestDAO.create({
      userSubject: subject,
      status: 'REQUESTED',
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
      query: {
        // TODO: remove when we have RBAC
        isSupervisor: Joi.boolean().default(false),
      },
    },
  },
  handler: async (request) => {
    const user = request.auth.credentials;
    const { id } = request.params;
    const { isSupervisor } = request.query;
    const studyRequest = await StudyRequestDAO.byId(id);
    if (studyRequest === null) {
      return Boom.notFound(`no study request found with ID ${id}`);
    }
    if (studyRequest.userSubject !== user.subject && !isSupervisor) {
      return Boom.forbidden('cannot view study request owned by another user');
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
      payload: {
        ...StudyRequest.update,
        // TODO: remove when we have RBAC
        isSupervisor: Joi.boolean().default(false),
      },
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
    if (studyRequestOld.userSubject !== user.subject && !isSupervisor) {
      return Boom.forbidden('cannot update study request owned by another user');
    }

    if (studyRequestNew.id !== studyRequestOld.id) {
      return Boom.badRequest('cannot change ID for study request');
    }
    if (!studyRequestNew.createdAt.equals(studyRequestOld.createdAt)) {
      return Boom.badRequest('cannot change creation timestamp for study request');
    }
    if (studyRequestNew.userSubject !== studyRequestOld.userSubject) {
      return Boom.badRequest('cannot change owner for study request');
    }
    if (studyRequestNew.status !== studyRequestOld.status && !isSupervisor) {
      return Boom.badRequest('cannot change status for study request');
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
    const user = request.auth.credentials;
    const { id } = request.params;
    const { isSupervisor } = request.query;
    const studyRequest = await StudyRequestDAO.byId(id);
    if (studyRequest === null) {
      return Boom.notFound(`no study request found with ID ${id}`);
    }
    if (studyRequest.userSubject !== user.subject && !isSupervisor) {
      return Boom.forbidden('cannot delete study request owned by another user');
    }
    const success = await StudyRequestDAO.delete(studyRequest);
    if (!success) {
      return Boom.notFound(`could not delete study request with ID ${id}`);
    }
    return { success };
  },
});

export default StudyRequestController;
