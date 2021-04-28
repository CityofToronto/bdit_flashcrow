/* eslint-disable class-methods-use-this */
import { ReportType } from '@/lib/Constants';
import { mapBy } from '@/lib/MapUtils';
import StudyRequestDAO from '@/lib/db/StudyRequestDAO';
import StudyRequestBulkDAO from '@/lib/db/StudyRequestBulkDAO';
import StudyRequestItemDAO from '@/lib/db/StudyRequestItemDAO';
import ReportBase from '@/lib/reports/ReportBase';
import {
  getStudyRequestItem,
  getStudyRequestBulkItem,
} from '@/lib/requests/RequestItems';
import RequestItemExport from '@/lib/requests/RequestItemExport';

/**
 * Subclass of {@link ReportBase} for exporting study requests from Track Requests.
 *
 * @see https://github.com/CityofToronto/bdit_flashcrow/issues/866
 */
class ReportTrackRequests extends ReportBase {
  type() {
    return ReportType.TRACK_REQUESTS;
  }

  async parseId(uuid) {
    /**
     * The ID here is just a random UUID, to keep each download separate.
     */
    return uuid;
  }

  async fetchRawData(uuid, filters, user) {
    const studyRequestItems = [];
    const studyRequestLocations = new Map();
    const studyRequestUsers = new Map();
    const studyRequestsBulk = [];

    const limit = 100;
    const total = await StudyRequestItemDAO.byQueryTotal(filters, user);
    for (let i = 0; i < total; i += limit) {
      const queryPage = {
        ...filters,
        limit,
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

      // fetch dependent locations, users
    }

    return {
      studyRequestItems,
      studyRequestLocations,
      studyRequestUsers,
      studyRequestsBulk,
    };
  }

  transformData(uuid, {
    studyRequestItems,
    studyRequestLocations,
    studyRequestUsers,
    studyRequestsBulk,
  }) {
    const items = studyRequestItems.map(({ bulk, request }) => {
      if (bulk) {
        return getStudyRequestBulkItem(
          studyRequestLocations,
          studyRequestUsers,
          request,
        );
      }
      return getStudyRequestItem(
        studyRequestLocations,
        studyRequestUsers,
        request,
      );
    });

    return { items, studyRequestsBulk };
  }

  generateCsv({ items, studyRequestsBulk }) {
    return RequestItemExport.get(items, studyRequestsBulk);
  }
}

export default ReportTrackRequests;
