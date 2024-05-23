import EmailBaseStudyRequest from '@/lib/email/EmailBaseStudyRequest';

/**
 * Notifies the requester that a study request needs additional clarification.  This is sent
 * immediately when Data Collection marks the request as Needs Clarification.
 *
 * Expected Recipients: Requester, All 'Staff Subscribed'
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
      return `[MOVE] Changes needed: #${id}`;
    }
    const { description } = this.location;
    return `[MOVE] Changes needed: #${id} - ${description}`;
  }

  /* eslint-disable-next-line class-methods-use-this */
  getBodyTemplate() {
    return `
    <div>
        <p>Before we can send your request out for collection, we need more information, or we need you to make changes.</p>
        <p><strong>{{studyType}}</strong> &mdash; {{hours}} &mdash; {{days}}</p>
        <p><a href="{{{hrefStudyRequest}}}">Update your request here</a></p>
        <p>If you need additional clarification on what information is needed, please check the comment section in MOVE, or email Data Collection at <a href="mailto:trafficdata@toronto.ca">TrafficData@toronto.ca</a>.</p>
    </div>`;
  }
}

export default EmailStudyRequestChangesNeeded;
