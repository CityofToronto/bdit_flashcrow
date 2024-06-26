import EmailBase from '@/lib/email/EmailBase';
import EmailBaseStudyRequest from '@/lib/email/EmailBaseStudyRequest';

/**
 * Notifies the Data Supervisors that a study request has been cancelled. This is sent
 * immediately upon study cancellation user flow in the frontend.
 *
 * Expected Recipients: Admins (move-ops@toronto.ca in non-prod; TrafficData@toronto.ca in prod)
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
