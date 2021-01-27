import EmailBaseStudyRequest from '@/lib/email/EmailBaseStudyRequest';

/**
 * Notifies the requester that a study request has been completed.  This is sent immediately when
 * Data Collection marks the request as completed.
 */
class EmailStudyRequestCompleted extends EmailBaseStudyRequest {
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
      return '[MOVE] Your request is complete!';
    }
    const { description } = this.location;
    return `[MOVE] Your request is complete! (${description})`;
  }

  /* eslint-disable-next-line class-methods-use-this */
  getBodyTemplate() {
    return `
    <div>
      <p>
        Your request for the following study
        {{#location}}
          at
          <a href="{{hrefLocation}}">{{location}}</a>
        {{/location}}
        is now complete!
        Your data will be available in MOVE within 1 business day.
      </p>
      <p>
        <strong>{{studyType}}</strong> &mdash; {{hours}} &mdash; {{days}}
      </p>
      <p>
        <a href="{{hrefStudyRequest}}">View your completed request</a>
      </p>
    </div>`;
  }
}

export default EmailStudyRequestCompleted;
