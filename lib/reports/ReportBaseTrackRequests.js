/* eslint-disable class-methods-use-this */
import ArrayUtils from '@/lib/ArrayUtils';
import { centrelineKey } from '@/lib/Constants';
import CentrelineDAO from '@/lib/db/CentrelineDAO';
import UserDAO from '@/lib/db/UserDAO';
import { NotImplementedError } from '@/lib/error/MoveErrors';
import CompositeId from '@/lib/io/CompositeId';
import ReportBase from '@/lib/reports/ReportBase';
import {
  getStudyRequestItem,
  getStudyRequestBulkItem,
} from '@/lib/requests/RequestItems';
import RequestItemExport from '@/lib/requests/RequestItemExport';
import StudyRequestCommentDAO from '@/lib/db/StudyRequestCommentDAO';

/**
 * Base class for all study-request-related reports, i.e. those reports that export study
 * requests from our study request management tools.
 *
 * @see https://github.com/CityofToronto/bdit_flashcrow/issues/866
 */
class ReportBaseTrackRequests extends ReportBase {
  // STUDY REQUEST METADATA

  async getStudyRequestItemsAndBulk() {
    throw new NotImplementedError();
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

  async getStudyRequestComments(studyRequests) {
    const studyRequestComments = new Map();
    studyRequests.forEach(async (studyRequest) => {
      const commentList = [];
      const studyId = studyRequest.id;
      const comments = await StudyRequestCommentDAO.byStudyRequest(studyRequest);
      comments.forEach((commentObject) => {
        commentList.push(commentObject.comment);
      });
      studyRequestComments.set(studyId, commentList);
    });
    return studyRequestComments;
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

    const featureChunks = ArrayUtils.chunk(features, ReportBaseTrackRequests.CHUNK_SIZE);
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

    const userIdChunks = ArrayUtils.chunk(userIds, ReportBaseTrackRequests.CHUNK_SIZE);
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

  // REPORT METHODS

  async fetchRawData(ids, filters, user) {
    const {
      studyRequestItems,
      studyRequestsBulk,
    } = await this.getStudyRequestItemsAndBulk(ids, filters, user);

    const studyRequests = this.getStudyRequests(studyRequestItems);
    const [
      studyRequestLocations,
      studyRequestUsers,
      studyRequestComments,
    ] = await Promise.all([
      this.getStudyRequestLocations(studyRequests),
      this.getStudyRequestUsers(studyRequests),
      this.getStudyRequestComments(studyRequests),
    ]);

    return {
      studyRequestItems,
      studyRequestLocations,
      studyRequestUsers,
      studyRequestComments,
      studyRequestsBulk,
    };
  }

  transformData(parsedId, {
    studyRequestItems,
    studyRequestLocations,
    studyRequestUsers,
    studyRequestComments,
    studyRequestsBulk,
  }) {
    const items = [];
    studyRequestItems.forEach(({ bulk, request }) => {
      if (bulk) {
        const itemBulk = getStudyRequestBulkItem(
          studyRequestLocations,
          studyRequestUsers,
          request,
          studyRequestComments,
        );
        items.push(...itemBulk.studyRequestBulk.studyRequests);
      } else {
        const item = getStudyRequestItem(
          studyRequestLocations,
          studyRequestUsers,
          request,
          studyRequestComments,
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

/**
 * @type {number}
 */
ReportBaseTrackRequests.CHUNK_SIZE = Math.min(100, CompositeId.MAX_FEATURES);

export default ReportBaseTrackRequests;
