import EmailBaseStudyRequest from '@/lib/email/EmailBaseStudyRequest';

/**
 * Notifies the requester that a study request has been cancelled.  This is sent immediately when
 * Data Collection marks the request as cancelled.
 *
 * Expected Recipients: Requester, All 'Staff Subscribed'
 */
class EmailStudyRequestCancelled extends EmailBaseStudyRequest {
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
      return `[MOVE] Request cancelled: #${id}`;
    }
    const { description } = this.location;
    return `[MOVE] Request cancelled: #${id} - ${description}`;
  }

  /* eslint-disable-next-line class-methods-use-this */
  getBodyTemplate() {
    return `
    <div>
      <p>
        Your request for the following study
        {{#location}}
          at {{location}}
        {{/location}}
        was cancelled:
      </p>
      <p>
        <strong>{{studyType}}</strong> &mdash; {{hours}} &mdash; {{days}}
      </p>
      <p>
        If you believe this was a mistake, please email Data Collection at
        <a href="mailto:TrafficData@toronto.ca">TrafficData@toronto.ca</a>.
      </p>
      <p>
        <a href="{{{hrefStudyRequest}}}">View your cancelled request</a>
      </p>
    </div>`;
  }
}

export default EmailStudyRequestCancelled;
