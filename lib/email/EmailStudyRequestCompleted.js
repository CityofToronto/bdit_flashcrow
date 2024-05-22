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
          at {{location}}
        {{/location}}
        is now complete!
      </p>
      <p>
        <strong>{{studyType}}</strong> &mdash; {{hours}} &mdash; {{days}}
      </p>
      <p>
        <a href="{{{hrefStudyRequest}}}">View your completed request</a>
      </p>
      <p><strong>How to get your data</strong></p>
      <ul>
        <li>TMC and Speed / Volume ATR studies will be available in MOVE within 24 hours.</li>
        <li>For all other studies, you will receive the data directly via email.</li>
        <li>If there is a problem loading your data, the Data Collection team will be in touch.</li>
        <li>If you still haven't received your requested data within 1-2 business days, please forward this email to move-team@toronto.ca.</li>
      </ul>
    </div>`;
  }
}

export default EmailStudyRequestCompleted;
