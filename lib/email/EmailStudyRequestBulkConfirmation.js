import Mustache from 'mustache';

import { centrelineKey, LocationSelectionType } from '@/lib/Constants';
import EmailBase from '@/lib/email/EmailBase';
import EmailBaseStudyRequestBulk from '@/lib/email/EmailBaseStudyRequestBulk';
import EmailStudyRequestUtils from '@/lib/email/EmailStudyRequestUtils';
import { getLocationsSelectionDescription } from '@/lib/geo/CentrelineUtils';
import CompositeId from '@/lib/io/CompositeId';

const TEMPLATE = `
<div>
  <p>
    We received your bulk request for the following studies
    {{#location}}
      to be conducted at
      <a href="{{hrefLocation}}>{{location}}</a>
    {{/location}}:
  </p>
  <p>
    {{name}}
  </p>
  <ul>
    {{#studyRequests}}
    <li>
      {{#location}}
        <a href="{{hrefLocation}}>{{location}}</a> &mdash;
      {{/location}}
      <strong>{{studyType}}</strong> &mdash; {{hours}} &mdash; {{days}}
    </li>
    {{/studyRequests}}
  </ul>
  <p>
    <a href="{{hrefStudyRequestBulk}}">View your bulk request</a>
  </p>
</div>`;
Mustache.parse(TEMPLATE);

class EmailStudyRequestBulkConfirmation extends EmailBaseStudyRequestBulk {
  getRecipients() {
    const { email } = this.user;
    const { ccEmails } = this.studyRequestBulk;
    return [email].concat(ccEmails);
  }

  getSubject() {
    const { name } = this.studyRequestBulk;
    return `[MOVE] Requests received for ${name}`;
  }

  getStudyRequestParams(studyRequest) {
    const days = EmailStudyRequestUtils.renderDays(studyRequest);
    const hours = EmailStudyRequestUtils.renderHours(studyRequest);
    const { studyType: { label: studyType } } = studyRequest;

    const key = centrelineKey(studyRequest);
    let location = null;
    let hrefLocation = null;
    if (this.studyRequestLocationsMap.has(key)) {
      const studyRequestLocation = this.studyRequestLocationsMap.get(key);
      location = studyRequestLocation.description;
      const s1 = CompositeId.encode([studyRequestLocation]);
      const selectionType = LocationSelectionType.POINTS;
      hrefLocation = EmailBase.getUrl(`/view/location/${s1}/${selectionType.name}`);
    }

    return {
      days,
      hours,
      hrefLocation,
      location,
      studyType,
    };
  }

  render() {
    const { id, name } = this.studyRequestBulk;
    const hrefStudyRequestBulk = EmailBase.getUrl(`requests/study/bulk/${id}`);

    /*
     * If this study somehow refers entirely to centreline features that no longer exist, we can
     * still send out the email without crashing.
     *
     * In this particular case, this is *extremely* unlikely.  The centreline would have to
     * be updated by our pipelines sometime between when the user starts the new study request
     * flow and when the email is sent out, and that update would have to remove all centreline
     * features that the user has selected.
     */
    let location = null;
    let hrefLocation = null;
    if (this.locationsSelection !== null) {
      location = getLocationsSelectionDescription(this.locationsSelection);
      const { locations, selectionType } = this.locationsSelection;
      const s1 = CompositeId.encode(locations);
      hrefLocation = EmailBase.getUrl(`/view/location/${s1}/${selectionType.name}`);
    }

    const studyRequests = this.studyRequestBulk.studyRequests.map(
      this.getStudyRequestParams.bind(this),
    );

    const params = {
      hrefLocation,
      hrefStudyRequestBulk,
      location,
      name,
      studyRequests,
    };
    return Mustache.render(TEMPLATE, params);
  }
}

export default EmailStudyRequestBulkConfirmation;
