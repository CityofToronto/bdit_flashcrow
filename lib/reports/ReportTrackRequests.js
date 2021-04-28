/* eslint-disable class-methods-use-this */
import ArrayUtils from '@/lib/ArrayUtils';
import { centrelineKey, ReportType } from '@/lib/Constants';
import { mapBy } from '@/lib/MapUtils';
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import StudyRequestDAO from '@/lib/db/StudyRequestDAO';
import StudyRequestBulkDAO from '@/lib/db/StudyRequestBulkDAO';
import StudyRequestItemDAO from '@/lib/db/StudyRequestItemDAO';
import UserDAO from '@/lib/db/UserDAO';
import CompositeId from '@/lib/io/CompositeId';
import ReportBase from '@/lib/reports/ReportBase';
import { parseStudyRequestReportId } from '@/lib/reports/ReportIdParser';
import {
  getStudyRequestItem,
  getStudyRequestBulkItem,
} from '@/lib/requests/RequestItems';
import RequestItemExport from '@/lib/requests/RequestItemExport';

const CHUNK_SIZE = Math.min(100, CompositeId.MAX_FEATURES);

/**
 * Subclass of {@link ReportBase} for exporting study requests from Track Requests.
 *
 * @see https://github.com/CityofToronto/bdit_flashcrow/issues/866
 */
class ReportTrackRequests extends ReportBase {
  type() {
    return ReportType.TRACK_REQUESTS;
  }

  async parseId(rawId) {
    const { ids } = await parseStudyRequestReportId(this.type(), rawId);
    return ids;
  }

  async getStudyRequestItemsForFilters(filters, user) {
    const studyRequestItems = [];

    const total = await StudyRequestItemDAO.byQueryTotal(filters, user);
    for (let i = 0; i < total; i += CHUNK_SIZE) {
      const queryPage = {
        ...filters,
        limit: CHUNK_SIZE,
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

  async getStudyRequestItemsAndBulk(ids, filters, user) {
    if (ids === null) {
      const studyRequestItems = await this.getStudyRequestItemsForFilters(filters, user);
      const studyRequestsBulk = studyRequestItems
        .filter(({ bulk }) => bulk)
        .map(({ request }) => request);
      return { studyRequestItems, studyRequestsBulk };
    }

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

  getStudyRequests(studyRequestItems) {
    const studyRequests = [];
    studyRequestItems.forEach(({ bulk, request }) => {
      if (bulk) {
        studyRequests.push(...request.studyRequests);
      } else {
        studyRequests.push(request);
      }
    });
    return studyRequests;
  }

  async getStudyRequestLocations(studyRequests) {
    const studyRequestLocations = new Map();

    const centrelineKeys = new Set();
    const features = [];
    studyRequests.forEach(({ centrelineId, centrelineType }) => {
      const feature = { centrelineId, centrelineType };
      const key = centrelineKey(feature);
      if (!centrelineKeys.has(key)) {
        centrelineKeys.add(key);
        features.push(feature);
      }
    });

    const featureChunks = ArrayUtils.chunk(features, CHUNK_SIZE);
    for (let i = 0; i < featureChunks.length; i++) {
      const featureChunk = featureChunks[i];
      /* eslint-disable-next-line no-await-in-loop */
      const locations = await CentrelineDAO.byFeatures(featureChunk);
      locations.forEach((location) => {
        if (location === null) {
          return;
        }
        const key = centrelineKey(location);
        studyRequestLocations.set(key, location);
      });
    }

    return studyRequestLocations;
  }

  async getStudyRequestUsers(studyRequests) {
    const studyRequestUsers = new Map();

    let userIds = new Set();
    studyRequests.forEach(({ userId }) => {
      userIds.add(userId);
    });
    userIds = Array.from(userIds);

    const userIdChunks = ArrayUtils.chunk(userIds, CHUNK_SIZE);
    for (let i = 0; i < userIdChunks.length; i++) {
      const userIdChunk = userIdChunks[i];
      /* eslint-disable-next-line no-await-in-loop */
      const users = await UserDAO.byIds(userIdChunk);
      users.forEach((user, userId) => {
        studyRequestUsers.set(userId, user);
      });
    }

    return studyRequestUsers;
  }

  async fetchRawData(ids, filters, user) {
    const {
      studyRequestItems,
      studyRequestsBulk,
    } = await this.getStudyRequestItemsAndBulk(ids, filters, user);

    const studyRequests = this.getStudyRequests(studyRequestItems);
    const [
      studyRequestLocations,
      studyRequestUsers,
    ] = await Promise.all([
      this.getStudyRequestLocations(studyRequests),
      this.getStudyRequestUsers(studyRequests),
    ]);

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
    const items = [];
    studyRequestItems.forEach(({ bulk, request }) => {
      if (bulk) {
        const itemBulk = getStudyRequestBulkItem(
          studyRequestLocations,
          studyRequestUsers,
          request,
        );
        items.push(...itemBulk.studyRequestBulk.studyRequests);
      } else {
        const item = getStudyRequestItem(
          studyRequestLocations,
          studyRequestUsers,
          request,
        );
        items.push(item);
      }
    });
    return { items, studyRequestsBulk };
  }

  generateCsv(parsedId, { items, studyRequestsBulk }) {
    return RequestItemExport.get(items, studyRequestsBulk);
  }
}

export default ReportTrackRequests;
