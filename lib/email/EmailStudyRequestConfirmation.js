import Mustache from 'mustache';

import CentrelineDAO from '@/lib/db/CentrelineDAO';
import EmailBase from '@/lib/email/EmailBase';
import TimeFormatters from '@/lib/time/TimeFormatters';

const TEMPLATE = `
<div>
  <p>
    We received your request for the following study
    {{#location}}
      to be conducted at {{location}}
    {{/location}}
    :
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
    const feature = { centrelineId, centrelineType };
    this.location = await CentrelineDAO.byFeature(feature);
  }

  getRecipients() {
    const { email } = this.user;
    const { ccEmails } = this.studyRequest;
    return [email].concat(ccEmails);
  }

  getSubject() {
    if (this.location === null) {
      return 'Request received - validation in progress';
    }
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

    /*
     * If this study somehow refers to a centreline feature that no longer exists, we can
     * still send out the email without crashing.
     *
     * In this particular case, this is *extremely* unlikely.  The centreline would have to
     * be updated by our pipelines sometime between when the user starts the new study request
     * flow and when the email is sent out, and that update would have to remove the centreline
     * feature that the user has selected.
     */
    let location = null;
    if (this.location !== null) {
      location = this.location.description;
    }

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
