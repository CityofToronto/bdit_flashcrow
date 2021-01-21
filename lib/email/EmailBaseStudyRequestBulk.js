import { centrelineKey } from '@/lib/Constants';
import { mapBy } from '@/lib/MapUtils';
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import UserDAO from '@/lib/db/UserDAO';
import EmailBase from '@/lib/email/EmailBase';
import CompositeId from '@/lib/io/CompositeId';

class EmailBaseStudyRequestBulk extends EmailBase {
  constructor(studyRequestBulk) {
    super();
    this.studyRequestBulk = studyRequestBulk;
    this.locationsSelection = null;
    this.requester = null;
    this.studyRequestLocationsMap = new Map();
  }

  async init() {
    const { s1, selectionType, studyRequests } = this.studyRequestBulk;

    const features = CompositeId.decode(s1);
    const [locations, requester] = await Promise.all([
      CentrelineDAO.byFeatures(features),
      UserDAO.byId(this.studyRequestBulk.userId),
    ]);
    const locationsFiltered = locations.filter(location => location !== null);
    if (locationsFiltered.length > 0) {
      this.locationsSelection = { locations: locationsFiltered, selectionType };
    }
    this.requester = requester;

    const studyRequestFeatures = studyRequests.map(
      ({ centrelineId, centrelineType }) => ({ centrelineId, centrelineType }),
    );
    let studyRequestLocations = await CentrelineDAO.byFeatures(studyRequestFeatures);
    studyRequestLocations = studyRequestLocations.filter(location => location !== null);
    this.locationsMap = mapBy(studyRequestLocations, centrelineKey);
  }
}

export default EmailBaseStudyRequestBulk;
