import { centrelineKey } from '@/lib/Constants';
import { mapBy } from '@/lib/MapUtils';
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import EmailBase from '@/lib/email/EmailBase';
import CompositeId from '@/lib/io/CompositeId';

class EmailBaseStudyRequestBulk extends EmailBase {
  constructor(user, studyRequestBulk) {
    super();
    this.user = user;
    this.studyRequestBulk = studyRequestBulk;
    this.studyRequestLocationsMap = new Map();
    this.locationsSelection = null;
  }

  async init() {
    const { s1, selectionType, studyRequests } = this.studyRequestBulk;

    const features = CompositeId.decode(s1);
    let locations = await CentrelineDAO.byFeatures(features);
    locations = locations.filter(location => location !== null);
    if (locations.length > 0) {
      this.locationsSelection = { locations, selectionType };
    }

    const studyRequestFeatures = studyRequests.map(
      ({ centrelineId, centrelineType }) => ({ centrelineId, centrelineType }),
    );
    let studyRequestLocations = await CentrelineDAO.byFeatures(studyRequestFeatures);
    studyRequestLocations = studyRequestLocations.filter(location => location !== null);
    this.locationsMap = mapBy(studyRequestLocations, centrelineKey);
  }
}

export default EmailBaseStudyRequestBulk;
