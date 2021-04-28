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

  async parseId(uuid) {
    /**
     * The ID here is just a random UUID, to keep each download separate.
     */
    return uuid;
  }

  async getStudyRequestItems(filters, user) {
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

  async fetchRawData(uuid, filters, user) {
    const studyRequestItems = await this.getStudyRequestItems(filters, user);
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
    };
  }

  transformData(uuid, {
    studyRequestItems,
    studyRequestLocations,
    studyRequestUsers,
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
    const studyRequestsBulk = studyRequestItems
      .filter(({ bulk }) => bulk)
      .map(({ request }) => request);

    return { items, studyRequestsBulk };
  }

  generateCsv(uuid, { items, studyRequestsBulk }) {
    return RequestItemExport.get(items, studyRequestsBulk);
  }
}

export default ReportTrackRequests;
