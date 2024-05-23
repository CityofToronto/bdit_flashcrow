import EmailBaseStudyRequestBulk from '@/lib/email/EmailBaseStudyRequestBulk';

/**
 * Notifies the requester that a project (bulk study request) has been cancelled.  This is sent
 * immediately when the whole project is marked as cancelled, either by Data Collection or by
 * the requester.
 */
class EmailStudyRequestBulkCancelled extends EmailBaseStudyRequestBulk {
  getRecipients() {
    const recipients = [];
    if (this.requester !== null) {
      recipients.push(this.requester.email);
    }
    return [
      ...recipients,
      ...this.studyRequestBulk.ccEmails,
    ];
  }

  getSubject() {
    const { name } = this.studyRequestBulk;
    return `[MOVE] Project cancelled: ${name}`;
  }

  /* eslint-disable-next-line class-methods-use-this */
  getBodyTemplate() {
    return `
    <div>
      <p>
        Your project for the following studies was cancelled:
      </p>
      ${EmailBaseStudyRequestBulk.TEMPLATE_LIST_STUDY_REQUESTS}
      <p>
        If you believe this was a mistake, please email Data Collection at
        <a href="mailto:trafficdata@toronto.ca">TrafficData@toronto.ca</a>.
      </p>
      <p>
        <a href="{{{hrefStudyRequestBulk}}}">View your cancelled project</a>
      </p>
    </div>`;
  }
}

export default EmailStudyRequestBulkCancelled;
