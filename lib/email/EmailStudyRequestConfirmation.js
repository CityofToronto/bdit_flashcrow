import Mustache from 'mustache';

import EmailBase from './EmailBase';
import CentrelineDAO from '../db/CentrelineDAO';
import { COUNT_TYPES } from '../../src/lib/Constants';

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

  // TODO: DRY with TimeFormatters
  static renderDaysOfWeek(daysOfWeek) {
    /*
     * For ease of comparison, we convert `daysOfWeek` to a 7-bit bitmask,
     * where bit `d` is set iff `daysOfWeek.includes(d)`.
     *
     * This allows us to quickly test against certain "special" bitmasks
     * below.
     */
    let bitMask = 0;
    daysOfWeek.forEach((d) => {
      /* eslint-disable no-bitwise */
      bitMask |= 1 << d;
    });
    if (bitMask === 0x7f) { // 1111111
      return 'any day';
    }
    if (bitMask === 0x3e) { // 0111110
      return 'weekdays';
    }
    if (bitMask === 0x41) { // 1000001
      return 'weekends';
    }
    const DAYS_OF_WEEK = [
      'Sun',
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
    ];
    return daysOfWeek
      .map(i => DAYS_OF_WEEK[i])
      .join(', ');
  }

  static renderHours({ automatic }, study) {
    const { daysOfWeek } = study;
    const daysOfWeekHuman = EmailStudyRequestConfirmation.renderDaysOfWeek(daysOfWeek);
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
