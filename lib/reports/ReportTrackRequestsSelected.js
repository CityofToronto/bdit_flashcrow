/* eslint-disable class-methods-use-this */
import { ReportType } from '@/lib/Constants';
import StudyRequestDAO from '@/lib/db/StudyRequestDAO';
import StudyRequestBulkDAO from '@/lib/db/StudyRequestBulkDAO';
import { InvalidReportIdError } from '@/lib/error/MoveErrors';
import ReportBaseTrackRequests from '@/lib/reports/ReportBaseTrackRequests';

/**
 * Subclass of {@link ReportBaseTrackRequests} for exporting study requests from Track Requests.
 * This report type exports only selected study requests from the current page in Track Requests.
 */
class ReportTrackRequestsSelected extends ReportBaseTrackRequests {
  type() {
    return ReportType.TRACK_REQUESTS_SELECTED;
  }

  async getStudyRequestItemsAndBulk(ids) {
    /*
     * In this case, all IDs are assumed to refer to individual study requests selected in the
     * frontend.  (Under the hood, selecting a bulk request actually selects all individual
     * study requests in that bulk request.)
     */
    const studyRequests = await StudyRequestDAO.byIds(ids);
    const studyRequestItems = studyRequests.map(request => ({ bulk: false, request }));

    /*
     * This also means that, unlike in the filtered download case, we need to look up associated
     * bulk study requests in a second pass, so that we have those to populate the project name
     * column.
     */
    let studyRequestBulkIds = new Set();
    studyRequests.forEach(({ studyRequestBulkId }) => {
      studyRequestBulkIds.add(studyRequestBulkId);
    });
    studyRequestBulkIds = Array.from(studyRequestBulkIds);
    const studyRequestsBulk = await StudyRequestBulkDAO.byIds(studyRequestBulkIds);
    return { studyRequestItems, studyRequestsBulk };
  }

  async parseId(rawId) {
    const ids = [];
    const idStrs = rawId.split(',');
    idStrs.forEach((idStr) => {
      const id = parseInt(idStr, 10);
      if (Number.isNaN(idStr)) {
        throw new InvalidReportIdError(rawId);
      }
      ids.push(id);
    });
    if (ids.length === 0) {
      throw new InvalidReportIdError(rawId);
    }
    return ids;
  }
}

export default ReportTrackRequestsSelected;
