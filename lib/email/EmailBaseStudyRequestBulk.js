import { centrelineKey } from '@/lib/Constants';
import { mapBy } from '@/lib/MapUtils';
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import UserDAO from '@/lib/db/UserDAO';
import EmailBase from '@/lib/email/EmailBase';
import EmailStudyRequestUtils from '@/lib/email/EmailStudyRequestUtils';

/**
 * Common superclass for email notifications related to bulk study requests.
 */
class EmailBaseStudyRequestBulk extends EmailBase {
  constructor(studyRequestBulk) {
    super();
    this.studyRequestBulk = studyRequestBulk;
    this.locationsSelection = null;
    this.requester = null;
    this.studyRequestLocationsMap = new Map();
  }

  async init() {
    const { studyRequests, userId } = this.studyRequestBulk;

    const requester = await UserDAO.byId(userId);
    this.requester = requester;

    const studyRequestFeatures = studyRequests.map(
      ({ centrelineId, centrelineType }) => ({ centrelineId, centrelineType }),
    );
    let studyRequestLocations = await CentrelineDAO.byFeatures(studyRequestFeatures);
    studyRequestLocations = studyRequestLocations.filter(location => location !== null);
    this.studyRequestLocationsMap = mapBy(studyRequestLocations, centrelineKey);
  }

  getStudyRequestParams(studyRequest) {
    const days = EmailStudyRequestUtils.renderDays(studyRequest);
    const hours = EmailStudyRequestUtils.renderHours(studyRequest);
    const { id, studyType: { label: studyType } } = studyRequest;
    const hrefStudyRequest = EmailBase.getUrl(`requests/study/${id}`);

    const key = centrelineKey(studyRequest);
    let location = null;
    if (this.studyRequestLocationsMap.has(key)) {
      const studyRequestLocation = this.studyRequestLocationsMap.get(key);
      location = studyRequestLocation.description;
    }

    return {
      days,
      hours,
      hrefStudyRequest,
      location,
      studyType,
    };
  }

  getBodyParams() {
    const { id, name } = this.studyRequestBulk;
    const hrefStudyRequestBulk = EmailBase.getUrl(`requests/study/bulk/${id}`);
    const studyRequests = this.studyRequestBulk.studyRequests.map(
      this.getStudyRequestParams.bind(this),
    );

    return {
      hrefStudyRequestBulk,
      name,
      studyRequests,
    };
  }
}

/**
 * List of individual study requests in a bulk request.  Each bulk request email should
 * contain this list.
 */
EmailBaseStudyRequestBulk.TEMPLATE_LIST_STUDY_REQUESTS = `
<p>
{{name}}
</p>
<div>
{{#studyRequests}}
  <div>
    {{#location}}
      {{location}} &mdash;
    {{/location}}
    <strong>{{studyType}}</strong> &mdash; {{hours}} &mdash; {{days}}
    (<a href="{{{hrefStudyRequest}}}">View request</a>)
  </div>
{{/studyRequests}}
</div>`;

export default EmailBaseStudyRequestBulk;
