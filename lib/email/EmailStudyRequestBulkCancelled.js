import EmailBaseStudyRequestBulk from '@/lib/email/EmailBaseStudyRequestBulk';

/**
 * Notifies the requester that a bulk study request has been cancelled.  This is sent immediately
 * when the request is marked as cancelled, either by Data Collection or by the requester.
 */
class EmailStudyRequestBulkCancelled extends EmailBaseStudyRequestBulk {
  getRecipients() {
    return [
      this.requester.email,
      ...this.studyRequestBulk.ccEmails,
    ];
  }

  getSubject() {
    const { name } = this.studyRequestBulk;
    return `[MOVE] Requests cancelled: ${name}`;
  }

  /* eslint-disable-next-line class-methods-use-this */
  getBodyTemplate() {
    return `
    <div>
      <p>
        Your bulk request for the following studies
        {{#location}}
          at
          <a href="{{hrefLocation}}>{{location}}</a>
        {{/location}}
        has been cancelled:
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
        If you believe this is a mistake, please reach out to the data collection team at
        <a href="mailto:trafficdata@toronto.ca">trafficdata@toronto.ca</a>.
      </p>
      <p>
        <a href="{{hrefStudyRequestBulk}}">View your cancelled bulk request</a>
      </p>
    </div>`;
  }
}

export default EmailStudyRequestBulkCancelled;
