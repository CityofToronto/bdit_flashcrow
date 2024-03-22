import CentrelineDAO from '@/lib/db/CentrelineDAO';
import UserDAO from '@/lib/db/UserDAO';
import EmailBase from '@/lib/email/EmailBase';

class EmailBaseStudyRequestChanged extends EmailBase {
  constructor(requestChanges) {
    super();
    this.requestChanges = requestChanges;
    this.locationOld = null;
    this.locationNew = null;
    this.requester = null;
  }

  async init() {
    const { featureOld, featureNew } = this.requestChanges;
    const [locationOld, locationNew, requester] = await Promise.all([
      CentrelineDAO.byFeature(featureOld),
      CentrelineDAO.byFeature(featureNew),
      UserDAO.byId(this.requestChanges.userId),
    ]);
    this.locationOld = locationOld;
    this.locationNew = locationNew;
    this.requester = requester;
  }

  /* eslint-disable-next-line class-methods-use-this */
  parseStudyChanges(studyChanges, locationOld, locationNew) {
    return studyChanges.map((studyChange) => {
      if (studyChange.changeType === 'Location') {
        return {
          changeType: studyChange.changeType,
          from: locationOld,
          to: locationNew,
        };
      }
      return studyChange;
    });
  }

  getBodyParams() {
    const { id } = this.requestChanges;
    const hrefStudyRequest = EmailBase.getUrl(`requests/study/${id}`);

    let locationOld = null;
    if (this.locationOld !== null) {
      locationOld = this.locationOld.description;
    }

    let locationNew = null;
    if (this.locationNew !== null) {
      locationNew = this.locationNew.description;
    }

    const studyChanges = this.parseStudyChanges(
      this.requestChanges.studyRequestChanges,
      locationOld,
      locationNew,
    );

    return {
      hrefStudyRequest,
      locationOld,
      studyChanges,
    };
  }
}

EmailBaseStudyRequestChanged.TEMPLATE_CHANGES_LIST = `
<div>
{{#studyChanges}}
  <p>
    <strong>{{changeType}}</strong> changed from: <i>{{from}}</i> to: <i>{{to}}</i>
  </p>
{{/studyChanges}}
</div>`;

export default EmailBaseStudyRequestChanged;
