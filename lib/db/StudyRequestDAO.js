import db from '@/lib/db/db';
import StudyDAO from '@/lib/db/StudyDAO';
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
  "reasons",
  "ccEmails",
  "centrelineId",
  "centrelineType",
  ST_AsGeoJSON("geom")::json AS "geom"
  FROM "study_requests"`;

async function attachStudies(studyRequests) {
  if (studyRequests.length === 0) {
    return studyRequests;
  }
  const studies = await StudyDAO.byStudyRequests(studyRequests);
  const studyRequestsAttached = studyRequests.map((studyRequest) => {
    const { id } = studyRequest;
    const studiesForRequest = studies.filter(({ studyRequestId }) => studyRequestId === id);
    return {
      ...studyRequest,
      studies: studiesForRequest,
    };
  });
  const studyRequestsSchema = Joi.array().items(StudyRequest.read);
  return studyRequestsSchema.validateAsync(studyRequestsAttached);
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
    const [studyRequestAttached] = await attachStudies([studyRequest]);
    return studyRequestAttached;
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
    return attachStudies(studyRequests);
  }

  /**
   * Fetch all study requests.
   *
   * @returns {Array<Object>} array of all study request objects
   */
  static async all() {
    const sql = `SELECT ${STUDY_REQUESTS_FIELDS}`;
    const studyRequests = await db.manyOrNone(sql);
    return attachStudies(studyRequests);
  }

  /**
   * Fetch study requests at the given centreline feature (segment or intersection).
   * TODO: link to CentrelineType
   *
   * @param {number} centrelineId - ID of feature in the centreline
   * @param {number} centrelineType - type of feature
   * @returns {Array<Object>} array of study request objects at given feature
   */
  static async byCentreline(centrelineId, centrelineType) {
    const sql = `SELECT ${STUDY_REQUESTS_FIELDS}
  WHERE "centrelineId" = $(centrelineId)
  AND "centrelineType" = $(centrelineType)`;
    const studyRequests = await db.manyOrNone(sql, { centrelineId, centrelineType });
    return attachStudies(studyRequests);
  }

  /**
   * Create a row for the given study request in database.
   *
   * @param {Object} studyRequest - study request information, as submitted by frontend
   * @returns {Object} study request object, as persisted to database
   */
  static async create(studyRequest) {
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
  "reasons",
  "ccEmails",
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
  $(reasons),
  $(ccEmails),
  $(centrelineId),
  $(centrelineType),
  ST_SetSRID(ST_GeomFromGeoJSON($(geom)), 4326)
) RETURNING "id"`;
    const persistedStudyRequest = {
      createdAt: DateTime.local(),
      lastEditorId: null,
      lastEditedAt: null,
      ...studyRequest,
    };
    const { id } = await db.one(sql, persistedStudyRequest);
    persistedStudyRequest.id = id;
    const studyPromises = studyRequest.studies.map(
      study => StudyDAO.create(persistedStudyRequest, study),
    );
    persistedStudyRequest.studies = await Promise.all(studyPromises);
    return StudyRequest.read.validateAsync(persistedStudyRequest);
  }

  /**
   * Updates the given study request.
   *
   * @param {Object} studyRequest - desired study request state
   * @returns {boolean} whether any rows were updated
   */
  static async update(studyRequest, editor) {
    const studies = await StudyDAO.updateByStudyRequest(studyRequest);
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
  "reasons" = $(reasons),
  "ccEmails" = $(ccEmails),
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
    const editedStudyRequestAttached = {
      ...editedStudyRequest,
      studies,
    };
    const studyRequestSchema = StudyRequest.read;
    return studyRequestSchema.validateAsync(editedStudyRequestAttached);
  }

  /**
   * Delete given study request.
   *
   * @param {Object} studyRequest - study request to delete
   * @param {number} studyRequest.id - ID of study request to delete, used to identify it
   * @returns {boolean} whether any rows were deleted
   */
  static async delete(studyRequest) {
    const [studiesDeleted] = await Promise.all([
      StudyDAO.deleteByStudyRequest(studyRequest),
      StudyRequestCommentDAO.deleteByStudyRequest(studyRequest),
    ]);
    const sql = 'DELETE FROM "study_requests" WHERE "id" = $(id)';
    const studyRequestsDeleted = await db.result(sql, studyRequest, r => r.rowCount);
    return studiesDeleted && studyRequestsDeleted === 1;
  }
}

export default StudyRequestDAO;
