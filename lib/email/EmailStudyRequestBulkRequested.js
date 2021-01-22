import EmailBaseStudyRequestBulk from '@/lib/email/EmailBaseStudyRequestBulk';

/**
 * Confirms to the requester that a bulk study request has been requested.  This is sent
 * immediately upon completion of the multi-location Request Study user flow in the frontend.
 */
class EmailStudyRequestBulkRequested extends EmailBaseStudyRequestBulk {
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
    return `[MOVE] Requests received for ${name}`;
  }

  /* eslint-disable-next-line class-methods-use-this */
  getBodyTemplate() {
    return `
    <div>
      <p>
        We received your bulk request for the following studies
        {{#location}}
          to be conducted at
          <a href="{{hrefLocation}}>{{location}}</a>
        {{/location}}:
      </p>
      <p>
        {{name}}
      </p>
      <ul>
        {{#studyRequests}}
        <li>
          {{#location}}
            <a href="{{hrefLocation}}>{{location}}</a> &mdash;
          {{/location}}
          <strong>{{studyType}}</strong> &mdash; {{hours}} &mdash; {{days}}
        </li>
        {{/studyRequests}}
      </ul>
      <p>
        <a href="{{hrefStudyRequestBulk}}">View your bulk request</a>
      </p>
    </div>`;
  }
}

export default EmailStudyRequestBulkRequested;
