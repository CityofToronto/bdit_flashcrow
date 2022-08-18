import EmailBaseStudyRequestBulk from '@/lib/email/EmailBaseStudyRequestBulk';

/**
 * Notifies the requester that a bulk study request has been completed.  This is sent immediately
 * when Data Collection marks the request as completed.
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
        Your data will be available in MOVE within the next 24 hours.
      </p>
      ${EmailBaseStudyRequestBulk.TEMPLATE_LIST_STUDY_REQUESTS}
      <p>
        <a href="{{{hrefStudyRequestBulk}}}">View your completed project</a>
      </p>
      <p><strong>How to get your data</strong></p>
      <ul>
        <li>TMC, Speed / Volume ATR, and Volume ATR studies will be available in MOVE within 24 hours.</li>
        <li>For all other studies, or if we are unable to load your data into MOVE, a member of the Data Collection team will email the data to you directly.</li>
        <li>If you still haven't received your requested data within 1-2 business days, please forward this email to move-team@toronto.ca.</li>
      </ul>
    </div>`;
  }
}

export default EmailStudyRequestBulkCompleted;
