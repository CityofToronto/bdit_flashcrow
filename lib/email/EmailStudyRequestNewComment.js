import { formatUsername } from '@/lib/StringFormatters';
import UserDAO from '@/lib/db/UserDAO';
import EmailBase from '@/lib/email/EmailBase';
import EmailBaseStudyRequest from '@/lib/email/EmailBaseStudyRequest';

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
      EmailBase.getRecipientStudyRequestAdmin('EmailStudyRequestNewComment'),
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
    return `[MOVE] New comment on request #${id} for ${description}`;
  }

  /* eslint-disable-next-line class-methods-use-this */
  getBodyTemplate() {
    return `
    <div>
      <p>
        A comment has been added to the {{studyType}} request
        {{#location}}
          for {{location}}
        {{/location}}
        {{#usernameCommenter}}
          by {{usernameCommenter}}
        {{/usernameCommenter}}:
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
