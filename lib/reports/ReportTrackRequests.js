/* eslint-disable class-methods-use-this */
import { ReportType } from '@/lib/Constants';
import { mapBy } from '@/lib/MapUtils';
import StudyRequestDAO from '@/lib/db/StudyRequestDAO';
import StudyRequestBulkDAO from '@/lib/db/StudyRequestBulkDAO';
import StudyRequestItemDAO from '@/lib/db/StudyRequestItemDAO';
import ReportBaseTrackRequests from '@/lib/reports/ReportBaseTrackRequests';

/**
 * Subclass of {@link ReportBaseTrackRequests} for exporting study requests from Track Requests.
 * This report type exports all study requests that match a given set of `StudyRequestFilters`,
 * including those requests that are not shown on the current page in Track Requests.
 */
class ReportTrackRequests extends ReportBaseTrackRequests {
  type() {
    return ReportType.TRACK_REQUESTS;
  }

  async getStudyRequestItemsForFilters(filters, user) {
    const studyRequestItems = [];

    const total = await StudyRequestItemDAO.byQueryTotal(filters, user);
    for (let i = 0; i < total; i += ReportBaseTrackRequests.CHUNK_SIZE) {
      const queryPage = {
        ...filters,
        limit: ReportBaseTrackRequests.CHUNK_SIZE,
        offset: i,
      };
      /* eslint-disable-next-line no-await-in-loop */
      const itemKeys = await StudyRequestItemDAO.byQuery(queryPage, user);

      const studyRequestIds = [];
      const studyRequestBulkIds = [];
      itemKeys.forEach(({ bulk, id }) => {
        if (bulk) {
          studyRequestBulkIds.push(id);
        } else {
          studyRequestIds.push(id);
        }
      });

      /* eslint-disable-next-line no-await-in-loop */
      const [studyRequestsPage, studyRequestsBulkPage] = await Promise.all([
        StudyRequestDAO.byIds(studyRequestIds),
        StudyRequestBulkDAO.byIds(studyRequestBulkIds),
      ]);
      const studyRequestsPageById = mapBy(studyRequestsPage, ({ id }) => id);
      const studyRequestsPageBulkById = mapBy(studyRequestsBulkPage, ({ id }) => id);

      itemKeys.forEach(({ bulk, id }) => {
        let itemRequest;
        if (bulk) {
          itemRequest = studyRequestsPageBulkById.get(id);
        } else {
          itemRequest = studyRequestsPageById.get(id);
        }
        const studyRequestItem = { bulk, request: itemRequest };
        studyRequestItems.push(studyRequestItem);
      });
    }

    return studyRequestItems;
  }

  async getStudyRequestItemsAndBulk(parsedId, filters, user) {
    const studyRequestItems = await this.getStudyRequestItemsForFilters(filters, user);
    const studyRequestsBulk = studyRequestItems
      .filter(({ bulk }) => bulk)
      .map(({ request }) => request);
    return { studyRequestItems, studyRequestsBulk };
  }

  async parseId(rawId) {
    return rawId;
  }
}

export default ReportTrackRequests;
