import Mustache from 'mustache';

import CentrelineDAO from '@/lib/db/CentrelineDAO';
import EmailBase from '@/lib/email/EmailBase';
import TimeFormatters from '@/lib/time/TimeFormatters';

const TEMPLATE = `
<div>
  <p>
    We received your request for the following study to be conducted at
    {{location}}:
  </p>
  <ul>
    <li><strong>{{studyType}}</strong>: {{hours}}</li>
  </ul>
  <p>
    <a href="{{href}}">Track Request</a>
  </p>
</div>`;
Mustache.parse(TEMPLATE);

/**
 * `EmailBase` subclass for confirming that a study request has been received.
 * This is sent immediately upon completion of the "Request Study" user flow
 * in the frontend.
 */
class EmailStudyRequestConfirmation extends EmailBase {
  constructor(user, studyRequest) {
    super();
    this.user = user;
    this.studyRequest = studyRequest;
    this.location = null;
  }

  async init() {
    const { centrelineId, centrelineType } = this.studyRequest;
    this.location = await CentrelineDAO.byIdAndType(centrelineId, centrelineType);
  }

  getRecipients() {
    const { email } = this.user;
    const { ccEmails } = this.studyRequest;
    return [email].concat(ccEmails);
  }

  getSubject() {
    const { description } = this.location;
    return `Request received for ${description} - validation in progress`;
  }

  static renderHours(studyRequest) {
    const {
      daysOfWeek,
      studyType: { automatic },
    } = studyRequest;
    const daysOfWeekHuman = TimeFormatters.formatDaysOfWeek(daysOfWeek);
    if (automatic) {
      const { duration } = studyRequest;
      return `${duration} hour count, on ${daysOfWeekHuman}`;
    }
    let { hours } = studyRequest;
    hours = hours.description.toLowerCase();
    return `${hours} hours, on ${daysOfWeekHuman}`;
  }

  render() {
    const { id } = this.studyRequest;
    const href = EmailBase.getUrl(`requests/study/${id}`);

    const { description: location } = this.location;

    const hours = EmailStudyRequestConfirmation.renderHours(this.studyRequest);
    const { studyType: { label: studyType } } = this.studyRequest;

    const params = {
      href,
      hours,
      location,
      studyType,
    };
    return Mustache.render(TEMPLATE, params);
  }
}

export default EmailStudyRequestConfirmation;
