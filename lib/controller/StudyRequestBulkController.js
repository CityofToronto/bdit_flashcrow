import { AuthScope } from '@/lib/Constants';
import StudyRequestBulkDAO from '@/lib/db/StudyRequestBulkDAO';
import StudyRequestBulk from '@/lib/model/StudyRequestBulk';
import EmailStudyRequestBulkConfirmation from '@/lib/email/EmailStudyRequestBulkConfirmation';
import Mailer from '@/lib/email/Mailer';
import LogTag from '@/lib/log/LogTag';

/**
 * CRUD handling for bulk study requests, including actions that affect all
 * sub-requests.
 *
 * @type {Array<Hapi.ServerRoute>}
 */
const StudyRequestBulkController = [];

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
      request.log(LogTag.ERROR, 'EmailStudyRequestBulkConfirmation: failed sending');
    }
    return studyRequestBulk;
  },
});

export default StudyRequestBulkController;
