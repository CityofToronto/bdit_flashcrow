import { centrelineKey, LocationSelectionType } from '@/lib/Constants';
import { mapBy } from '@/lib/MapUtils';
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import UserDAO from '@/lib/db/UserDAO';
import EmailBase from '@/lib/email/EmailBase';
import EmailStudyRequestUtils from '@/lib/email/EmailStudyRequestUtils';
import { getLocationsSelectionDescription } from '@/lib/geo/CentrelineUtils';
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

  getBodyParams() {
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

    return {
      hrefLocation,
      hrefStudyRequestBulk,
      location,
      name,
      studyRequests,
    };
  }
}

export default EmailBaseStudyRequestBulk;
