import { StudyRequestStatus } from '@/lib/Constants';
import db from '@/lib/db/db';
import StudyRequestChangeDAO from '@/lib/db/StudyRequestChangeDAO';
import StudyRequestCommentDAO from '@/lib/db/StudyRequestCommentDAO';
import StudyRequestItemDAO from '@/lib/db/StudyRequestItemDAO';
import Joi from '@/lib/model/Joi';
import StudyRequest from '@/lib/model/StudyRequest';
import DateTime from '@/lib/time/DateTime';

/**
 * Defines the fields fetched for study requests.
 *
 * @memberof StudyRequestDAO
 * @type {string}
 */
const STUDY_REQUESTS_FIELDS = `
  "id",
  "createdAt",
  "userId",
  "studyRequestBulkId",
  "status",
  "urgent",
  "urgentReason",
  "assignedTo",
  "dueDate",
  "reason",
  "reasonOther",
  "ccEmails",
  "studyType",
  "studyTypeOther",
  "daysOfWeek",
  "duration",
  "hours",
  "notes",
  "centrelineId",
  "centrelineType",
  ST_AsGeoJSON("geom")::json AS "geom"
  FROM "study_requests"`;

function getCentrelineFilter(features) {
  const featureIds = features.map(
    ({ centrelineId, centrelineType }) => `(${centrelineType}, ${centrelineId})`,
  );
  const featureIdsStr = featureIds.join(', ');
  return `("centrelineType", "centrelineId") IN (${featureIdsStr})`;
}

/**
 * Data Access Object for study requests, which are submitted by various users
 * to request that the TSU conduct specific traffic studies at a given location.
 */
class StudyRequestDAO {
  /**
   * Fetch the study request with the given ID.
   *
   * @param {number} id - ID to fetch study request for
   * @returns {Object} study request object, or null if no such study request exists
   */
  static async byId(id) {
    const sql = `SELECT ${STUDY_REQUESTS_FIELDS} WHERE "id" = $(id)`;
    const studyRequest = await db.oneOrNone(sql, { id });
    if (studyRequest === null) {
      return null;
    }
    return StudyRequest.read.validateAsync(studyRequest);
  }

  /**
   * Fetch the study requests with the given IDs.
   *
   * @param {Array<number>} ids - IDs to fetch study requests for
   * @returns {Array<Object>} study request objects
   */
  static async byIds(ids) {
    if (ids.length === 0) {
      return [];
    }
    const sql = `SELECT ${STUDY_REQUESTS_FIELDS} WHERE "id" IN ($(ids:csv)) ORDER BY "id" ASC`;
    const studyRequests = await db.manyOrNone(sql, { ids });
    if (studyRequests.length === 0) {
      return studyRequests;
    }
    const studyRequestsSchema = Joi.array().items(StudyRequest.read);
    return studyRequestsSchema.validateAsync(studyRequests);
  }

  /**
   * Fetch study requests that are part of the given bulk study request.
   *
   * @param {Object} studyRequestBulk - bulk study request object
   * @param {string} studyRequestBulk.id - bulk study request ID
   * @returns {Array<Object>} array of study request objects that are part of the given
   * bulk study request
   */
  static async byStudyRequestBulk({ id: studyRequestBulkId }) {
    const sql = `
SELECT ${STUDY_REQUESTS_FIELDS}
WHERE "studyRequestBulkId" = $(studyRequestBulkId)
ORDER BY "id" ASC`;
    const studyRequests = await db.manyOrNone(sql, { studyRequestBulkId });
    const studyRequestsSchema = Joi.array().items(StudyRequest.read);
    return studyRequestsSchema.validateAsync(studyRequests);
  }

  /**
   * Fetch study requests that are part of one of the given bulk study requests.
   *
   * @param {Array} studyRequestsBulk - bulk study request objects
   * @returns {Array<Object>} array of study request objects that are part of the given
   * bulk study request
   */
  static async byStudyRequestsBulk(studyRequestsBulk) {
    if (studyRequestsBulk.length === 0) {
      return [];
    }
    const studyRequestBulkIds = studyRequestsBulk.map(({ id }) => id);
    const sql = `
SELECT ${STUDY_REQUESTS_FIELDS}
WHERE "studyRequestBulkId" IN ($(studyRequestBulkIds:csv))
ORDER BY "studyRequestBulkId" ASC, "id" ASC`;
    const studyRequests = await db.manyOrNone(sql, { studyRequestBulkIds });
    const studyRequestsSchema = Joi.array().items(StudyRequest.read);
    return studyRequestsSchema.validateAsync(studyRequests);
  }

  /**
   * Fetch study requests at the given centreline features (segments or intersections).
   *
   * @param {Array<Object>} features - centreline features
   * @returns {Array<Object>} array of study request objects at given features
   */
  static async byCentreline(features) {
    if (features.length === 0) {
      return [];
    }
    const centrelineFilter = getCentrelineFilter(features);
    const sql = `SELECT ${STUDY_REQUESTS_FIELDS} WHERE ${centrelineFilter}`;
    const studyRequests = await db.manyOrNone(sql);
    const studyRequestsSchema = Joi.array().items(StudyRequest.read);
    return studyRequestsSchema.validateAsync(studyRequests);
  }

  /**
   * Fetch pending study requests at the given centreline features.  A study request is pending
   * if it is in an editable state.
   *
   * @param {Array<Object>} features - centreline features
   * @returns {Array<Object>} array of pending study request objects at given feature
   */
  static async byCentrelinePending(features) {
    if (features.length === 0) {
      return [];
    }
    const centrelineFilter = getCentrelineFilter(features);
    const statusesEditable = StudyRequestStatus.enumValues
      .filter(({ editable }) => editable)
      .map(({ name }) => name);
    const sql = `
SELECT ${STUDY_REQUESTS_FIELDS}
WHERE ${centrelineFilter}
AND "status" IN ($(statusesEditable:csv))`;
    const studyRequests = await db.manyOrNone(sql, { statusesEditable });
    const studyRequestsSchema = Joi.array().items(StudyRequest.read);
    return studyRequestsSchema.validateAsync(studyRequests);
  }

  /**
   * Create a row for the given study request in database.
   *
   * @param {Object} studyRequest - study request information, as submitted by frontend
   * @param {Object} user - user creating this study request
   * @returns {Object} study request object, as persisted to database
   */
  static async create(studyRequest, user) {
    const sql = `
INSERT INTO "study_requests" (
  "createdAt",
  "userId",
  "studyRequestBulkId",
  "status",
  "urgent",
  "urgentReason",
  "assignedTo",
  "dueDate",
  "reason",
  "reasonOther",
  "ccEmails",
  "studyType",
  "studyTypeOther",
  "daysOfWeek",
  "duration",
  "hours",
  "notes",
  "centrelineId",
  "centrelineType",
  "geom"
) VALUES (
  $(createdAt),
  $(userId),
  $(studyRequestBulkId),
  $(status),
  $(urgent),
  $(urgentReason),
  $(assignedTo),
  $(dueDate),
  $(reason),
  $(reasonOther),
  $(ccEmails),
  $(studyType),
  $(studyTypeOther),
  $(daysOfWeek),
  $(duration),
  $(hours),
  $(notes),
  $(centrelineId),
  $(centrelineType),
  ST_SetSRID(ST_GeomFromGeoJSON($(geom)), 4326)
) RETURNING "id"`;
    const { id: userId } = user;
    const persistedStudyRequest = {
      createdAt: DateTime.local(),
      userId,
      studyRequestBulkId: null,
      status: StudyRequestStatus.REQUESTED,
      assignedTo: null,
      ...studyRequest,
    };
    const { id } = await db.one(sql, persistedStudyRequest);
    persistedStudyRequest.id = id;

    await StudyRequestItemDAO.upsertByStudyRequest(persistedStudyRequest);

    return StudyRequest.read.validateAsync(persistedStudyRequest);
  }

  /**
   * Updates the given study request.
   *
   * @param {Object} studyRequest - desired study request state
   * @returns {boolean} whether any rows were updated
   */
  static async update(studyRequest) {
    const sql = `
UPDATE "study_requests" SET
  "userId" = $(userId),
  "status" = $(status),
  "urgent" = $(urgent),
  "urgentReason" = $(urgentReason),
  "assignedTo" = $(assignedTo),
  "dueDate" = $(dueDate),
  "reason" = $(reason),
  "reasonOther" = $(reasonOther),
  "ccEmails" = $(ccEmails),
  "studyType" = $(studyType),
  "studyTypeOther" = $(studyTypeOther),
  "daysOfWeek" = $(daysOfWeek),
  "duration" = $(duration),
  "hours" = $(hours),
  "notes" = $(notes),
  "centrelineId" = $(centrelineId),
  "centrelineType" = $(centrelineType),
  "geom" = ST_SetSRID(ST_GeomFromGeoJSON($(geom)), 4326)
  WHERE "id" = $(id)`;
    await db.query(sql, studyRequest);

    await StudyRequestItemDAO.upsertByStudyRequest(studyRequest);

    return StudyRequest.read.validateAsync(studyRequest);
  }

  /**
   * Delete given study request.
   *
   * @param {Object} studyRequest - study request to delete
   * @param {number} studyRequest.id - ID of study request to delete, used to identify it
   * @returns {boolean} whether any rows were deleted
   */
  static async delete(studyRequest) {
    await StudyRequestChangeDAO.deleteByStudyRequest(studyRequest);
    await StudyRequestCommentDAO.deleteByStudyRequest(studyRequest);
    await StudyRequestItemDAO.deleteByStudyRequest(studyRequest);

    const sql = 'DELETE FROM "study_requests" WHERE "id" = $(id)';
    const studyRequestsDeleted = await db.result(sql, studyRequest, r => r.rowCount);
    return studyRequestsDeleted === 1;
  }

  static async deleteByStudyRequestBulk(studyRequestBulk) {
    const { studyRequests } = studyRequestBulk;
    await StudyRequestChangeDAO.deleteByStudyRequests(studyRequests);
    await StudyRequestCommentDAO.deleteByStudyRequests(studyRequests);

    /*
     * We deliberately do not call `StudyRequestItemDAO` here, as we don't create items for
     * individual requests within bulk requests.  Deletion of the bulk item is handled in
     * `StudyRequestBulkDAO.delete`.
     */

    const ids = studyRequests.map(({ id }) => id);
    const sql = 'DELETE FROM "study_requests" WHERE "id" IN ($(ids:csv))';
    const studyRequestsDeleted = await db.result(sql, { ids }, r => r.rowCount);
    return studyRequestsDeleted === studyRequests.length;
  }
}

export default StudyRequestDAO;
