import Mustache from 'mustache';

import { COUNT_TYPES } from '@/lib/Constants';
import CentrelineDAO from '@/../lib/db/CentrelineDAO';
import EmailBase from '@/../lib/email/EmailBase';
import TimeFormatters from '@/lib/time/TimeFormatters';

const TEMPLATE = `
<div>
  {{#location}}
  <p>
    We received your request for the following studies to be conducted at
    <a href="{{href}}">{{description}}</a>:
  </p>
  {{/location}}
  <ul>
    {{#studies}}
      <li><strong>{{type}}</strong>: {{hours}}</li>
    {{/studies}}
  </ul>
  <p>
    You can <a href="{{href}}">check on the status of your request here</a>.  We'll
    automatically notify you when we've validated it.
  </p>
  <p>
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
    const { email, name } = this.user;
    const { ccEmails } = this.studyRequest;
    return [
      `${name} <${email}>`,
    ].concat(ccEmails);
  }

  getSubject() {
    const { description } = this.location;
    return `Request received for ${description} - validation in progress`;
  }

  static renderHours({ automatic }, study) {
    const { daysOfWeek } = study;
    const daysOfWeekHuman = TimeFormatters.formatDaysOfWeek(daysOfWeek);
    if (automatic) {
      const { duration } = study;
      return `${duration} hour count, on ${daysOfWeekHuman}`;
    }
    const { hours: hoursUpper } = study;
    const hours = hoursUpper.toLowerCase();
    return `${hours} hours, on ${daysOfWeekHuman}`;
  }

  render() {
    const { id, studies: studiesRaw } = this.studyRequest;
    const href = EmailBase.getUrl(`requests/study/${id}`);

    const {
      centrelineId,
      centrelineType,
      description,
    } = this.location;
    const locationHref = EmailBase.getUrl(
      `/view/location/${centrelineType}/${centrelineId}`,
    );
    const location = {
      description,
      href: locationHref,
    };

    const studies = studiesRaw
      .map((study) => {
        const { studyType } = study;
        const countType = COUNT_TYPES.find(({ value }) => value === studyType);
        const hours = EmailStudyRequestConfirmation.renderHours(countType, study);
        const { label: type } = countType;
        return { hours, type };
      });

    const params = {
      href,
      location,
      studies,
    };
    return Mustache.render(TEMPLATE, params);
  }
}

export default EmailStudyRequestConfirmation;
