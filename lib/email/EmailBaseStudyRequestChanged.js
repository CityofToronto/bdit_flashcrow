import CentrelineDAO from '@/lib/db/CentrelineDAO';
import UserDAO from '@/lib/db/UserDAO';
import EmailBase from '@/lib/email/EmailBase';

class EmailBaseStudyRequestChanged extends EmailBase {
  constructor(requestChanges) {
    super();
    this.requestChanges = requestChanges;
    this.location = null;
    this.requester = null;
  }

  async init() {
    const { centrelineId, centrelineType } = this.requestChanges;
    const feature = { centrelineId, centrelineType };
    const [location, requester] = await Promise.all([
      CentrelineDAO.byFeature(feature),
      UserDAO.byId(this.studyRequest.userId),
    ]);
    this.location = location;
    this.requester = requester;
  }

  getBodyParams() {
    const { id } = this.requestChanges;
    const hrefStudyRequest = EmailBase.getUrl(`requests/study/${id}`);

    let location = null;
    if (this.location !== null) {
      location = this.location.description;
    }

    const studyChanges = this.requestChanges.studyRequestChanges;

    return {
      hrefStudyRequest,
      location,
      studyChanges,
    };
  }
}

EmailBaseStudyRequestChanged.TEMPLATE_CHANGES_LIST = `
<div>
{{#studyChanges}}
  <div>
    &mdash; <strong>{{changeType}}</strong> changed from: {{from}} to: {{to}}
  </div>
{{/studyChanges}}
</div>`;

export default EmailBaseStudyRequestChanged;
