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
    return `[MOVE] Your requests are complete! (${name})`;
  }

  /* eslint-disable-next-line class-methods-use-this */
  getBodyTemplate() {
    return `
    <div>
      <p>
        Your requests for the following studies
        {{#location}}
          at {{location}}
        {{/location}}
        are now complete!
        Your data will be available in MOVE within 1 business day.
      </p>
      ${EmailBaseStudyRequestBulk.TEMPLATE_LIST_STUDY_REQUESTS}
      <p>
        <a href="{{{hrefStudyRequestBulk}}}">View your completed bulk request</a>
      </p>
    </div>`;
  }
}

export default EmailStudyRequestBulkCompleted;
