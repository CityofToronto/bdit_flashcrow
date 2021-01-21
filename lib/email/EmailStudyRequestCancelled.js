import EmailBaseStudyRequest from '@/lib/email/EmailBaseStudyRequest';

/**
 * Notifies the requester that a study request has been completed.  This is sent immediately when
 * Data Collection marks the request as completed.
 */
class EmailStudyRequestCancelled extends EmailBaseStudyRequest {
  getRecipients() {
    return [
      this.requester.email,
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
          at
          <a href="{{hrefLocation}}>{{location}}</a>
        {{/location}}
        has been cancelled:
      </p>
      <p>
        <strong>{{studyType}}</strong> &mdash; {{hours}} &mdash; {{days}}
      </p>
      <p>
        If you believe this is a mistake, please comment on the request in MOVE, or reach out
        to the data collection team at
        <a href="mailto:trafficdata@toronto.ca">trafficdata@toronto.ca</a>.
      </p>
      <p>
        <a href="{{hrefStudyRequest}}">View your cancelled request</a>
      </p>
    </div>`;
  }
}

export default EmailStudyRequestCancelled;
