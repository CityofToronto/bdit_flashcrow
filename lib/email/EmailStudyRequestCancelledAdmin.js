import EmailBase from '@/lib/email/EmailBase';
import EmailBaseStudyRequest from '@/lib/email/EmailBaseStudyRequest';

/**
 * Notifies the Data supervisors that a study request has been canceled. This is sent
 * immediately upon study cancelation user flow in the frontend.
 */
class EmailStudyRequestCancelledAdmin extends EmailBaseStudyRequest {
  /* eslint-disable-next-line class-methods-use-this */
  getRecipients() {
    return [
      EmailBase.getRecipientStudyRequestAdmin(),
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
        <p>The following study at {{location}} was cancelled:</p>
        <p><strong>{{studyType}}</strong> &mdash; {{hours}} &mdash; {{days}}</p>
        <p><a href="{{{hrefStudyRequest}}}">View request</a></p>
    </div>`;
  }
}

export default EmailStudyRequestCancelledAdmin;
