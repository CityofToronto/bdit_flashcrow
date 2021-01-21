import CentrelineDAO from '@/lib/db/CentrelineDAO';
import EmailBase from '@/lib/email/EmailBase';

class EmailBaseStudyRequest extends EmailBase {
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
}

export default EmailBaseStudyRequest;
