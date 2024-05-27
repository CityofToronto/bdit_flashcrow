import EmailBaseStudyRequestBulk from '@/lib/email/EmailBaseStudyRequestBulk';

/**
 * Notifies the requester that a project (bulk study request) has been completed.  This is sent
 * immediately when Data Collection marks the request as completed.
 *
 * Expected Recipients: Requester, All 'Staff Subscribed’ to the project
 */
class EmailStudyRequestBulkCompleted extends EmailBaseStudyRequestBulk {
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
    return `[MOVE] Project complete: ${name}`;
  }

  /* eslint-disable-next-line class-methods-use-this */
  getBodyTemplate() {
    return `
    <div>
      <p>
        Your project for the following studies is now complete!
      </p>
      ${EmailBaseStudyRequestBulk.TEMPLATE_LIST_STUDY_REQUESTS}
      <p>
        <a href="{{{hrefStudyRequestBulk}}}">View your completed project</a>
      </p>
      <p><strong>How to get your data</strong></p>
      <ul>
        <li>TMC and Speed / Volume ATR studies will be available in MOVE within 24 hours.</li>
        <li>If there is a problem loading your data, the Data Collection team will be in touch.</li>
        <li>For all other studies, you will receive the data directly via email.</li>
        <li>If you still haven't received your requested data within 1-2 business days, please forward this email to move-team@toronto.ca.</li>
      </ul>
    </div>`;
  }
}

export default EmailStudyRequestBulkCompleted;
