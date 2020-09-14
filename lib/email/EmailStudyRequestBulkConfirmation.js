import Mustache from 'mustache';

import CentrelineDAO from '@/lib/db/CentrelineDAO';
import EmailBase from '@/lib/email/EmailBase';
import TimeFormatters from '@/lib/time/TimeFormatters';

const TEMPLATE = `
<div>
  <p>
    We received your request for the following studies to be conducted as
    part of {{name}}:
  </p>
  <ul>
    {{#studies}}
    <li>
      <strong>{{studyType}}</strong>
      {{#location}}
        <span>at {{location}}</span>
      {{/location}}
      <span>: {{hours}}</span>
    </li>
    {{/studies}}
  </ul>
  <p>
    <a href="{{href}}">Track Request</a>
  </p>
</div>`;
Mustache.parse(TEMPLATE);

class EmailStudyRequestBulkConfirmation extends EmailBase {
  constructor(user, studyRequestBulk) {
    super();
    this.user = user;
    this.studyRequestBulk = studyRequestBulk;
    this.locations = null;
  }

  async init() {
    const features = this.studyRequestBulk.studyRequests.map(
      ({ centrelineId, centrelineType }) => ({ centrelineId, centrelineType }),
    );
    this.locations = await CentrelineDAO.byFeatures(features);
  }

  getRecipients() {
    const { email } = this.user;
    const { ccEmails } = this.studyRequestBulk;
    return [email].concat(ccEmails);
  }

  getSubject() {
    const { name } = this.studyRequestBulk;
    return `Bulk request received for ${name} - validation in progress`;
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
    const { id } = this.studyRequestBulk;
    const href = EmailBase.getUrl(`requests/study/bulk/${id}`);

    const { name, studyRequests } = this.studyRequestBulk;
    const studies = studyRequests.map((studyRequest) => {
      const hours = EmailStudyRequestBulkConfirmation.renderHours(studyRequest);
      const {
        centrelineId,
        centrelineType,
        studyType: { label: studyType },
      } = studyRequest;
      const studyRequestLocation = this.locations.find(
        location => location.centrelineType === centrelineType
          && location.centrelineId === centrelineId,
      );
      const location = studyRequestLocation === undefined ? '' : studyRequestLocation.description;
      return { hours, location, studyType };
    });

    const params = {
      href,
      name,
      studies,
    };
    return Mustache.render(TEMPLATE, params);
  }
}

export default EmailStudyRequestBulkConfirmation;
