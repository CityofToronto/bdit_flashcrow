import Boom from '@hapi/boom';

import { AuthScope, LocationSelectionType } from '@/lib/Constants';
import StudyRequestBulkDAO from '@/lib/db/StudyRequestBulkDAO';
import StudyRequestChangeDAO from '@/lib/db/StudyRequestChangeDAO';
import EmailStudyRequestBulkConfirmation from '@/lib/email/EmailStudyRequestBulkConfirmation';
import Mailer from '@/lib/email/Mailer';
import LogTag from '@/lib/log/LogTag';
import Joi from '@/lib/model/Joi';
import StudyRequestBulk from '@/lib/model/StudyRequestBulk';
import StudyRequestChange from '@/lib/model/StudyRequestChange';
import CentrelineSelection from '@/lib/model/helpers/CentrelineSelection';

/**
 * CRUD handling for bulk study requests, including actions that affect all
 * sub-requests.
 *
 * @type {Array<Hapi.ServerRoute>}
 */
const StudyRequestBulkController = [];

/**
 * Create a new bulk study request.  This endpoint also sends an email to the requester
 * and any persons CC'd.
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
      scope: [AuthScope.STUDY_REQUESTS_EDIT.name],
    },
    response: {
      schema: StudyRequestBulk.read,
    },
    validate: {
      payload: StudyRequestBulk.create,
    },
  },
  handler: async (request) => {
    const user = request.auth.credentials;
    const studyRequestBulk = await StudyRequestBulkDAO.create(request.payload, user);
    try {
      const email = new EmailStudyRequestBulkConfirmation(user, studyRequestBulk);
      const emailOptions = await email.getOptions();
      const emailResponse = await Mailer.send(emailOptions);
      request.log(LogTag.DEBUG, emailResponse);
    } catch (err) {
      request.log(LogTag.ERROR, err);
    }
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
    response: {
      schema: {
        name: Joi.string().required(),
      },
    },
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
 * Fetch pending bulk study requests at the given centreline features.
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
    response: {
      schema: Joi.array().items(StudyRequestBulk.read),
    },
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

// TODO: add PUT endpoint here

// STUDY REQUEST CHANGES

/**
 * Get status changes for the given bulk study request.
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
    response: {
      schema: Joi.array().items(StudyRequestChange.read),
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
    return StudyRequestChangeDAO.byStudyRequestBulk(studyRequestBulk);
  },
});

export default StudyRequestBulkController;
