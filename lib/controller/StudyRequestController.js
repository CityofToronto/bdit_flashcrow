import Boom from '@hapi/boom';
import Joi from '@hapi/joi';

import StudyRequestDAO from '@/lib/db/StudyRequestDAO';
import EmailStudyRequestConfirmation from '@/lib/email/EmailStudyRequestConfirmation';
import Mailer from '@/lib/email/Mailer';
import LogTag from '@/lib/log/LogTag';
import StudyRequest from '@/lib/model/StudyRequest';

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
      schema: StudyRequest.persisted,
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
      schema: StudyRequest.persisted,
    },
    validate: {
      params: {
        id: Joi.number().integer().positive().required(),
      },
    },
  },
  handler: async (request) => {
    const user = request.auth.credentials;
    const { id } = request.params;
    const studyRequest = await StudyRequestDAO.byId(id);
    if (studyRequest === null) {
      return Boom.notFound(`no study request found with ID ${id}`);
    }
    // TODO: remove this for supervisor view
    if (studyRequest.userSubject !== user.subject) {
      return Boom.forbidden('cannot view study request owned by another user');
    }
    return studyRequest;
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
      schema: StudyRequest.persisted,
    },
    validate: {
      params: {
        id: Joi.number().integer().positive().required(),
      },
      payload: StudyRequest.persistedUpdate,
    },
  },
  handler: async (request) => {
    const user = request.auth.credentials;
    const { id } = request.params;
    const studyRequestOld = await StudyRequestDAO.byId(id);
    if (studyRequestOld === null) {
      return Boom.notFound(`no study request found with ID ${id}`);
    }
    // TODO: supervisor view?
    if (studyRequestOld.userSubject !== user.subject) {
      return Boom.forbidden('cannot update study request owned by another user');
    }
    const studyRequestNew = request.payload;
    if (studyRequestNew.id !== studyRequestOld.id) {
      return Boom.badRequest('cannot change ID for study request');
    }
    if (!studyRequestNew.createdAt.equals(studyRequestOld.createdAt)) {
      return Boom.badRequest('cannot change creation timestamp for study request');
    }
    if (studyRequestNew.userSubject !== studyRequestOld.userSubject) {
      // TODO: can supervisors change the owner of a request?
      return Boom.badRequest('cannot change owner for study request');
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
    validate: {
      params: {
        id: Joi.number().integer().positive().required(),
      },
    },
  },
  handler: async (request) => {
    const user = request.auth.credentials;
    const { id } = request.params;
    const studyRequest = await StudyRequestDAO.byId(id);
    if (studyRequest === null) {
      return Boom.notFound(`no study request found with ID ${id}`);
    }
    // TODO: supervisor view?
    if (studyRequest.userSubject !== user.subject) {
      return Boom.forbidden('cannot view study request owned by another user');
    }
    const success = StudyRequestDAO.delete(studyRequest);
    if (!success) {
      return Boom.notFound(`no study request found with ID ${id}`);
    }
    return { success };
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
      schema: Joi.array().items(StudyRequest.persisted),
    },
  },
  handler: async (request) => {
    // TODO: pagination
    // TODO: admin fetching for TSU
    const user = request.auth.credentials;
    return StudyRequestDAO.byUser(user);
  },
});

export default StudyRequestController;
