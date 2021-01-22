import EmailBase from '@/lib/email/EmailBase';
import EmailBaseStudyRequest from '@/lib/email/EmailBaseStudyRequest';

/**
 * Notifies the Data Collection team that a new study request has been requested.  This is sent
 * immediately upon completion of the single-location Request Study user flow in the frontend.
 */
class EmailStudyRequestRequestedAdmin extends EmailBaseStudyRequest {
  /* eslint-disable-next-line class-methods-use-this */
  getRecipients() {
    return [
      EmailBase.getRecipientStudyRequestAdmin(),
    ];
  }

  getSubject() {
    if (this.location === null) {
      return '[MOVE] New request';
    }
    const { description } = this.location;
    return `[MOVE] New request for ${description}`;
  }

  /* eslint-disable-next-line class-methods-use-this */
  getBodyTemplate() {
    return `
    <div>
      <p>
        A request has been submitted for the following study
        {{#location}}
          to be conducted at
          <a href="{{hrefLocation}}>{{location}}</a>
        {{/location}}:
      </p>
      <p>
        <strong>{{studyType}}</strong> &mdash; {{hours}} &mdash; {{days}}
      </p>
      <p>
        <a href="{{hrefStudyRequest}}">View request</a>
      </p>
    </div>`;
  }
}

export default EmailStudyRequestRequestedAdmin;
