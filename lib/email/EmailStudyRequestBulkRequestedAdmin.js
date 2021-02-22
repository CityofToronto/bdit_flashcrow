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
      EmailBase.getRecipientStudyRequestAdmin(),
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
        A bulk request has been submitted for the following studies
        {{#location}}
          to be conducted at {{location}}
        {{/location}}:
      </p>
      ${EmailBaseStudyRequestBulk.TEMPLATE_LIST_STUDY_REQUESTS}
      <p>
        <a href="{{{hrefStudyRequestBulk}}}">View bulk request</a>
      </p>
    </div>`;
  }
}

export default EmailStudyRequestBulkRequestedAdmin;
