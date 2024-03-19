import EmailBaseStudyRequest from '@/lib/email/EmailBaseStudyRequest';

/**
 * Notifies the requester that a study request needs clairification.  This is sent immediately when
 * Data Collection marks the request as needs clairification.
 */
class EmailStudyRequestChangesNeeded extends EmailBaseStudyRequest {
  getRecipients() {
    const recipients = [];
    if (this.requester !== null) {
      recipients.push(this.requester.email);
    }
    return [
      ...recipients,
      ...this.studyRequest.ccEmails,
    ];
  }

  getSubject() {
    const { id } = this.studyRequest;
    if (this.location === null) {
      return `[MOVE] Changes Needed: #${id}`;
    }
    const { description } = this.location;
    return `[MOVE] Changes Needed: #${id} - ${description}`;
  }

  /* eslint-disable-next-line class-methods-use-this */
  getBodyTemplate() {
    return `
    <div>
        <p>Before we can send your request out for collection, we need more information, or we need you to make changes.</p>
        <p><strong>{{studyType}}</strong> &mdash; {{hours}} &mdash; {{days}}</p>
        <p><a href="{{{hrefStudyRequest}}}">Update your request here</a></p>
        <p>If you need additional clarification on what information is needed, please check the comment section in MOVE, or email the Data Collection team (<a href="mailto:TrafficData@toronto.ca>TrafficData@toronto.ca</a>).</p>
    </div>`;
  }
}

export default EmailStudyRequestChangesNeeded;
