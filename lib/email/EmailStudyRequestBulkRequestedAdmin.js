import EmailBase from '@/lib/email/EmailBase';
import EmailBaseStudyRequestBulk from '@/lib/email/EmailBaseStudyRequestBulk';

/**
 * Notifies the Data Collection team that a new bulk study request has been requested.  This is sent
 * immediately upon completion of the multi-location Request Study user flow in the frontend.
 */
class EmailStudyRequestBulkRequestedAdmin extends EmailBaseStudyRequestBulk {
  /* eslint-disable-next-line class-methods-use-this */
  getRecipients() {
    return [
      EmailBase.TO_DATA_COLLECTION,
    ];
  }

  getSubject() {
    const { name } = this.studyRequestBulk;
    return `[MOVE] New requests for ${name}`;
  }

  /* eslint-disable-next-line class-methods-use-this */
  getBodyTemplate() {
    return `
    <div>
      <p>
        A request has been submitted for the following studies
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
        <a href="{{hrefStudyRequestBulk}}">View bulk request</a>
      </p>
    </div>`;
  }
}

export default EmailStudyRequestBulkRequestedAdmin;
