import { StudyRequestStatus } from '@/lib/Constants';
import db from '@/lib/db/db';
import StudyRequestChangeDAO from '@/lib/db/StudyRequestChangeDAO';
import StudyRequestCommentDAO from '@/lib/db/StudyRequestCommentDAO';
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
  "status",
  "closed",
  "lastEditorId",
  "lastEditedAt",
  "serviceRequestId",
  "urgent",
  "urgentReason",
  "assignedTo",
  "dueDate",
  "estimatedDeliveryDate",
  "reason",
  "ccEmails",
  "studyType",
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
   * Fetch study requests owned by the given user.
   *
   * @param {Object} user - user object
   * @param {string} user.id - user ID
   * @returns {Array<Object>} array of study request objects owned by the given user
   */
  static async byUser({ id: userId }) {
    const sql = `SELECT ${STUDY_REQUESTS_FIELDS} WHERE "userId" = $(userId)`;
    const studyRequests = await db.manyOrNone(sql, { userId });
    const studyRequestsSchema = Joi.array().items(StudyRequest.read);
    return studyRequestsSchema.validateAsync(studyRequests);
  }

  /**
   * Fetch all study requests.
   *
   * @returns {Array<Object>} array of all study request objects
   */
  static async all() {
    const sql = `SELECT ${STUDY_REQUESTS_FIELDS}`;
    const studyRequests = await db.manyOrNone(sql);
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
    const centrelineFilter = getCentrelineFilter(features);
    const sql = `SELECT ${STUDY_REQUESTS_FIELDS} WHERE ${centrelineFilter}`;
    const studyRequests = await db.manyOrNone(sql);
    const studyRequestsSchema = Joi.array().items(StudyRequest.read);
    return studyRequestsSchema.validateAsync(studyRequests);
  }

  /**
   * Fetch pending (i.e. non-closed) study requests at the given centreline features.
   *
   * @param {Array<Object>} features - centreline features
   * @returns {Array<Object>} array of study request objects at given feature
   */
  static async byCentrelinePending(features) {
    const centrelineFilter = getCentrelineFilter(features);
    const sql = `SELECT ${STUDY_REQUESTS_FIELDS} WHERE ${centrelineFilter} AND NOT "closed"`;
    const studyRequests = await db.manyOrNone(sql);
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
  "status",
  "closed",
  "lastEditorId",
  "lastEditedAt",
  "serviceRequestId",
  "urgent",
  "urgentReason",
  "assignedTo",
  "dueDate",
  "estimatedDeliveryDate",
  "reason",
  "ccEmails",
  "studyType",
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
  $(status),
  $(closed),
  $(lastEditorId),
  $(lastEditedAt),
  $(serviceRequestId),
  $(urgent),
  $(urgentReason),
  $(assignedTo),
  $(dueDate),
  $(estimatedDeliveryDate),
  $(reason),
  $(ccEmails),
  $(studyType),
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
      status: StudyRequestStatus.REQUESTED,
      closed: false,
      lastEditorId: null,
      lastEditedAt: null,
      assignedTo: null,
      ...studyRequest,
    };
    const { id } = await db.one(sql, persistedStudyRequest);
    persistedStudyRequest.id = id;
    return StudyRequest.read.validateAsync(persistedStudyRequest);
  }

  /**
   * Updates the given study request.
   *
   * @param {Object} studyRequest - desired study request state
   * @param {Object} editor - user updating this study request
   * @returns {boolean} whether any rows were updated
   */
  static async update(studyRequest, editor) {
    const sql = `
UPDATE "study_requests" SET
  "userId" = $(userId),
  "status" = $(status),
  "closed" = $(closed),
  "lastEditorId" = $(lastEditorId),
  "lastEditedAt" = $(lastEditedAt),
  "serviceRequestId" = $(serviceRequestId),
  "urgent" = $(urgent),
  "urgentReason" = $(urgentReason),
  "assignedTo" = $(assignedTo),
  "dueDate" = $(dueDate),
  "estimatedDeliveryDate" = $(estimatedDeliveryDate),
  "reason" = $(reason),
  "ccEmails" = $(ccEmails),
  "studyType" = $(studyType),
  "daysOfWeek" = $(daysOfWeek),
  "duration" = $(duration),
  "hours" = $(hours),
  "notes" = $(notes),
  "centrelineId" = $(centrelineId),
  "centrelineType" = $(centrelineType),
  "geom" = ST_SetSRID(ST_GeomFromGeoJSON($(geom)), 4326)
  WHERE "id" = $(id)`;
    const editedStudyRequest = {
      ...studyRequest,
      lastEditorId: editor.id,
      lastEditedAt: DateTime.local(),
    };
    await db.query(sql, editedStudyRequest);
    return StudyRequest.read.validateAsync(editedStudyRequest);
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

    const sql = 'DELETE FROM "study_requests" WHERE "id" = $(id)';
    const studyRequestsDeleted = await db.result(sql, studyRequest, r => r.rowCount);
    return studyRequestsDeleted === 1;
  }
}

export default StudyRequestDAO;
