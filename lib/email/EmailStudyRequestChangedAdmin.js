import EmailBase from '@/lib/email/EmailBase';
import EmailBaseStudyRequestChanged from '@/lib/email/EmailBaseStudyRequestChanged';

/**
 * Notifies the Data Supervisors that a study request has been edited.  This is sent immediately
 * after a the study request is edited via the edit user flow.
 */
class EmailStudyRequestChanged extends EmailBaseStudyRequestChanged {
  /* eslint-disable-next-line class-methods-use-this */
  getRecipients() {
    return [
      EmailBase.getRecipientStudyRequestAdmin(),
    ];
  }

  getSubject() {
    const { id } = this.requestChanges;
    if (this.locationOld === null) {
      return `[MOVE] Request changed: #${id}`;
    }
    const { description } = this.locationOld;
    return `[MOVE] Request changed: #${id} - ${description}`;
  }

  /* eslint-disable-next-line class-methods-use-this */
  getBodyTemplate() {
    return `
    <div>
      <p>
      The study
        {{#locationOld}}
          at <strong>{{locationOld}}</strong>
        {{/locationOld}}
        has had the following changes:
      </p>
      ${EmailBaseStudyRequestChanged.TEMPLATE_CHANGES_LIST}
      <p>
        <a href="{{{hrefStudyRequest}}}">View changed request</a>
      </p>
    </div>`;
  }
}

export default EmailStudyRequestChanged;