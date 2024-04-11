import EmailBase from '@/lib/email/EmailBase';
import EmailBaseStudyRequestBulk from '@/lib/email/EmailBaseStudyRequestBulk';

/**
 * Notifies the Data supervisors that a bulk study request has been cancelled. This is sent
 * immediately when the request is marked as cancelled, either by Data Collection or by the
 * requester.
 */
class EmailStudyRequestBulkCancelledAdmin extends EmailBaseStudyRequestBulk {
  /* eslint-disable-next-line class-methods-use-this */
  getRecipients() {
    return [
      EmailBase.getRecipientStudyRequestAdmin(),
    ];
  }

  getSubject() {
    const { name } = this.studyRequestBulk;
    return `[MOVE] Project request cancelled: ${name}`;
  }

  /* eslint-disable-next-line class-methods-use-this */
  getBodyTemplate() {
    return `
    <div>
      <p>
        The project for the following studies has been cancelled:
      </p>
      ${EmailBaseStudyRequestBulk.TEMPLATE_LIST_STUDY_REQUESTS}
      <p>
        <a href="{{{hrefStudyRequestBulk}}}">View cancelled project</a>
      </p>
    </div>`;
  }
}

export default EmailStudyRequestBulkCancelledAdmin;
