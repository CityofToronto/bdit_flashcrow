import EmailBaseStudyRequestBulk from '@/lib/email/EmailBaseStudyRequestBulk';

/**
 * Notifies the requester that a project (bulk study request) requires changes.  This is sent
 * immediately when Data Collection marks the request as Needs Clarification.
 */
class EmailStudyRequestBulkChangesNeeded extends EmailBaseStudyRequestBulk {
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
    return `[MOVE] Changes needed: ${name}`;
  }

  /* eslint-disable-next-line class-methods-use-this */
  getBodyTemplate() {
    return `
    <div>
        <p>Before we can send your project out for collection, we need more information, or we need you to make changes.</p>
        ${EmailBaseStudyRequestBulk.TEMPLATE_LIST_STUDY_REQUESTS}
        <p><a href="{{{hrefStudyRequest}}}">Update your requests here</a></p>
        <p>If you need additional clarification on what information is needed, please check the comment section in MOVE, or email Data Collection at (<a href="mailto:TrafficData@toronto.ca>TrafficData@toronto.ca</a>).</p>
    </div>`;
  }
}

export default EmailStudyRequestBulkChangesNeeded;
