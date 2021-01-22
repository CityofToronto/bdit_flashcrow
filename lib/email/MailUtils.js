import { StudyRequestStatus } from '@/lib/Constants';
import StudyRequestBulkDAO from '@/lib/db/StudyRequestBulkDAO';
import EmailStudyRequestBulkCancelled from '@/lib/email/EmailStudyRequestBulkCancelled';
import EmailStudyRequestBulkCompleted from '@/lib/email/EmailStudyRequestBulkCompleted';
import EmailStudyRequestCancelled from '@/lib/email/EmailStudyRequestCancelled';
import EmailStudyRequestCompleted from '@/lib/email/EmailStudyRequestCompleted';
import Mailer from '@/lib/email/Mailer';
import LogTag from '@/lib/log/LogTag';
import { bulkStatus } from '@/lib/requests/RequestStudyBulkUtils';

function getStudyRequestUpdateEmails(studyRequestNew, studyRequestOld) {
  const emails = [];

  if (studyRequestNew.status !== studyRequestOld.status) {
    if (studyRequestNew.status === StudyRequestStatus.CANCELLED) {
      const emailCancelled = new EmailStudyRequestCancelled(studyRequestNew);
      emails.push(emailCancelled);
    } else if (studyRequestNew.status === StudyRequestStatus.COMPLETED) {
      const emailCompleted = new EmailStudyRequestCompleted(studyRequestNew);
      emails.push(emailCompleted);
    }
  }

  return emails;
}

function getStudyRequestBulkUpdateEmails(studyRequestBulkNew, studyRequestBulkOld) {
  const emails = [];

  const bulkStatusOld = bulkStatus(studyRequestBulkOld);
  const bulkStatusNew = bulkStatus(studyRequestBulkNew);
  if (bulkStatusNew !== bulkStatusOld) {
    if (bulkStatusNew === StudyRequestStatus.CANCELLED) {
      const emailCancelled = new EmailStudyRequestBulkCancelled(studyRequestBulkNew);
      emails.push(emailCancelled);
    } else if (bulkStatusNew === StudyRequestStatus.COMPLETED) {
      const emailCompleted = new EmailStudyRequestBulkCompleted(studyRequestBulkNew);
      emails.push(emailCompleted);
    }
  }

  return emails;
}

async function sendEmailSafe(request, email) {
  try {
    const emailOptions = await email.getOptions();
    const emailResponse = await Mailer.send(emailOptions);
    request.log(LogTag.DEBUG, emailResponse);
    return true;
  } catch (err) {
    request.log(LogTag.ERROR, err);
    return false;
  }
}

async function sendStudyRequestBulkUpdateEmailsSafe(
  request,
  studyRequestBulkNew,
  studyRequestBulkOld,
) {
  const emails = getStudyRequestBulkUpdateEmails(studyRequestBulkNew, studyRequestBulkOld);

  const n = studyRequestBulkNew.studyRequests.length;
  for (let i = 0; i < n; i++) {
    const studyRequestNew = studyRequestBulkNew.studyRequests[i];
    const studyRequestOld = studyRequestBulkOld.studyRequests[i];

    const emailsStudyRequest = getStudyRequestUpdateEmails(studyRequestNew, studyRequestOld);
    emails.push(...emailsStudyRequest);
  }

  if (emails.length === 0) {
    return true;
  }
  const tasks = emails.map(email => sendEmailSafe(request, email));
  const results = await Promise.all(tasks);
  return results.every(result => result);
}

async function sendStudyRequestUpdateEmailsSafe(
  request,
  studyRequestNew,
  studyRequestOld,
) {
  const emails = getStudyRequestUpdateEmails(studyRequestNew, studyRequestOld);

  if (studyRequestNew.studyRequestBulkId !== null) {
    const studyRequestBulk = await StudyRequestBulkDAO.byId(studyRequestNew.studyRequestBulkId);
    const i = studyRequestBulk.studyRequests.findIndex(
      ({ id }) => id === studyRequestNew.id,
    );
    if (i !== -1) {
      /*
       * We use `studyRequestNew`, `studyRequestOld` to reconstruct both the new and old versions
       * of the associated bulk request.  This allows us to not have to depend on the order in
       * which this function is called in the REST API endpoint handler.  (For example: if we only
       * used `studyRequestNew` to reconstruct the new version, we'd be relying on
       * `studyRequestBulk` being the old version, which would imply that this function must be
       * called before the study request update.)
       */
      const studyRequestBulkNew = {
        ...studyRequestBulk,
        studyRequests: [...studyRequestBulk.studyRequests],
      };
      studyRequestBulkNew.studyRequests[i] = studyRequestNew;

      const studyRequestBulkOld = {
        ...studyRequestBulk,
        studyRequests: [...studyRequestBulk.studyRequests],
      };
      studyRequestBulkOld.studyRequests[i] = studyRequestOld;

      const emailsStudyRequestBulk = getStudyRequestBulkUpdateEmails(
        studyRequestBulkNew,
        studyRequestBulkOld,
      );
      emails.push(...emailsStudyRequestBulk);
    }
  }

  if (emails.length === 0) {
    return true;
  }
  const tasks = emails.map(email => sendEmailSafe(request, email));
  const results = await Promise.all(tasks);
  return results.every(result => result);
}

const MailUtils = {
  getStudyRequestBulkUpdateEmails,
  getStudyRequestUpdateEmails,
  sendEmailSafe,
  sendStudyRequestBulkUpdateEmailsSafe,
  sendStudyRequestUpdateEmailsSafe,
};

export {
  MailUtils as default,
  getStudyRequestBulkUpdateEmails,
  getStudyRequestUpdateEmails,
  sendEmailSafe,
  sendStudyRequestBulkUpdateEmailsSafe,
  sendStudyRequestUpdateEmailsSafe,
};
