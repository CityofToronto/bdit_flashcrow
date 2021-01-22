import EmailBaseStudyRequest from '@/lib/email/EmailBaseStudyRequest';

/**
 * Confirms to the requester that a study request has been requested.  This is sent immediately upon
 * completion of the single-location Request Study user flow in the frontend.
 */
class EmailStudyRequestRequested extends EmailBaseStudyRequest {
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
    if (this.location === null) {
      return '[MOVE] Request received';
    }
    const { description } = this.location;
    return `[MOVE] Request received for ${description}`;
  }

  /* eslint-disable-next-line class-methods-use-this */
  getBodyTemplate() {
    return `
    <div>
      <p>
        We received your request for the following study
        {{#location}}
          to be conducted at
          <a href="{{hrefLocation}}>{{location}}</a>
        {{/location}}:
      </p>
      <p>
        <strong>{{studyType}}</strong> &mdash; {{hours}} &mdash; {{days}}
      </p>
      <p>
        <a href="{{hrefStudyRequest}}">View your request</a>
      </p>
    </div>`;
  }
}

export default EmailStudyRequestRequested;
