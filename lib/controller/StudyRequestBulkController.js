import Boom from '@hapi/boom';

import { AuthScope } from '@/lib/Constants';
import StudyRequestBulkDAO from '@/lib/db/StudyRequestBulkDAO';
import StudyRequestBulk from '@/lib/model/StudyRequestBulk';
import EmailStudyRequestBulkConfirmation from '@/lib/email/EmailStudyRequestBulkConfirmation';
import Mailer from '@/lib/email/Mailer';
import LogTag from '@/lib/log/LogTag';
import Joi from '@/lib/model/Joi';

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
 * Get the study request with the given ID.
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
      return Boom.notFound(`no study request found with ID ${id}`);
    }
    return studyRequestBulk;
  },
});

export default StudyRequestBulkController;
