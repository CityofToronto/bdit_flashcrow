import CentrelineDAO from '@/lib/db/CentrelineDAO';
import UserDAO from '@/lib/db/UserDAO';
import EmailBase from '@/lib/email/EmailBase';

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
}

export default EmailBaseStudyRequest;
