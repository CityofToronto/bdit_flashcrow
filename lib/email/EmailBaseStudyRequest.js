import { LocationSelectionType } from '@/lib/Constants';
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import UserDAO from '@/lib/db/UserDAO';
import EmailBase from '@/lib/email/EmailBase';
import EmailStudyRequestUtils from '@/lib/email/EmailStudyRequestUtils';
import CompositeId from '@/lib/io/CompositeId';

class EmailBaseStudyRequest extends EmailBase {
  constructor(studyRequest) {
    super();
    this.studyRequest = studyRequest;
    this.location = null;
    this.requester = null;
  }

  async init() {
    const { centrelineId, centrelineType } = this.studyRequest;
    const feature = { centrelineId, centrelineType };
    const [location, requester] = await Promise.all([
      CentrelineDAO.byFeature(feature),
      UserDAO.byId(this.studyRequest.userId),
    ]);
    this.location = location;
    this.requester = requester;
  }

  getBodyParams() {
    const { id } = this.studyRequest;
    const hrefStudyRequest = EmailBase.getUrl(`requests/study/${id}`);

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
    let hrefLocation = null;
    if (this.location !== null) {
      location = this.location.description;
      const s1 = CompositeId.encode([this.location]);
      const selectionType = LocationSelectionType.POINTS;
      hrefLocation = EmailBase.getUrl(`/view/location/${s1}/${selectionType.name}`);
    }

    const days = EmailStudyRequestUtils.renderDays(this.studyRequest);
    const hours = EmailStudyRequestUtils.renderHours(this.studyRequest);
    const { studyType: { label: studyType } } = this.studyRequest;

    return {
      days,
      hrefLocation,
      hrefStudyRequest,
      hours,
      location,
      studyType,
    };
  }
}

export default EmailBaseStudyRequest;
