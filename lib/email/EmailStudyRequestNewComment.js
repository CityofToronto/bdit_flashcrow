import { formatUsername } from '@/lib/StringFormatters';
import UserDAO from '@/lib/db/UserDAO';
import EmailBase from '@/lib/email/EmailBase';
import EmailBaseStudyRequest from '@/lib/email/EmailBaseStudyRequest';

/**
 * Notifies request watchers that a study request has a new comment.  This is sent immediately when
 * a comment is added to the study request page.
 *
 * Expected Recipients: Admins (move-ops@toronto.ca in non-prod; TrafficData@toronto.ca in prod),
 * Requester, All 'Staff Subscribed', commenter
 */

class EmailStudyRequestNewComment extends EmailBaseStudyRequest {
  constructor(studyRequest, studyRequestComment) {
    super(studyRequest);
    this.studyRequestComment = studyRequestComment;
    this.commenter = null;
  }

  async init() {
    await super.init();
    const commenter = await UserDAO.byId(this.studyRequestComment.userId);
    this.commenter = commenter;
  }

  getRecipients() {
    let recipients = [
      EmailBase.getRecipientStudyRequestAdmin(),
    ];
    if (this.requester !== null) {
      recipients.push(this.requester.email);
    }
    recipients = [
      ...recipients,
      ...this.studyRequest.ccEmails,
    ];
    if (this.commenter !== null) {
      recipients = recipients.filter(email => email !== this.commenter.email);
    }
    return recipients;
  }

  getSubject() {
    const { id } = this.studyRequest;
    if (this.location === null) {
      return `[MOVE] New comment on request #${id}`;
    }
    const { description } = this.location;
    return `[MOVE] New comment on request #${id} at ${description}`;
  }

  /* eslint-disable-next-line class-methods-use-this */
  getBodyTemplate() {
    return `
    <div>
      <p>
        {{#usernameCommenter}}
          {{usernameCommenter}}
        {{/usernameCommenter}}
        added a comment to the <strong>{{studyType}}</strong> request
        {{#location}}
          at {{location}}
        {{/location}}:
      </p>
      <p>
        <i>{{comment}}</i>
      </p>
      <p>
        <a href="{{{hrefStudyRequest}}}">View or respond to this comment</a>
      </p>
    </div>`;
  }

  getBodyParams() {
    const params = super.getBodyParams();
    const { comment } = this.studyRequestComment;
    const usernameCommenter = this.commenter === null ? null : formatUsername(this.commenter);
    return {
      ...params,
      comment,
      usernameCommenter,
    };
  }
}

export default EmailStudyRequestNewComment;
