import db from '@/lib/db/db';
import StudyDAO from '@/lib/db/StudyDAO';
import StudyRequestCommentDAO from '@/lib/db/StudyRequestCommentDAO';
import DateTime from '@/lib/time/DateTime';

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
    const sql = `
SELECT
  "id",
  "createdAt",
  "userSubject",
  "status",
  "closed",
  "serviceRequestId",
  "priority",
  "assignedTo",
  "dueDate",
  "estimatedDeliveryDate",
  "reasons",
  "ccEmails",
  "centrelineId",
  "centrelineType",
  ST_AsGeoJSON("geom")::json AS "geom"
  FROM "study_requests" WHERE "id" = $(id)`;
    const studyRequest = await db.oneOrNone(sql, { id });
    if (studyRequest === null) {
      return null;
    }
    const studies = await StudyDAO.byStudyRequests([studyRequest]);
    studyRequest.studies = studies;
    return studyRequest;
  }

  /**
   * Fetch study requests owned by the given user.
   *
   * @param {Object} user - user object
   * @param {string} user.subject - user "subject", as returned by OpenID Connect
   * @returns {Array<Object>} array of study request objects owned by the given user
   */
  static async byUser({ subject }) {
    const sql = `
SELECT
  "id",
  "createdAt",
  "userSubject",
  "status",
  "closed",
  "serviceRequestId",
  "priority",
  "assignedTo",
  "dueDate",
  "estimatedDeliveryDate",
  "reasons",
  "ccEmails",
  "centrelineId",
  "centrelineType",
  ST_AsGeoJSON("geom")::json AS "geom"
  FROM "study_requests" WHERE "userSubject" = $(subject)`;
    const studyRequests = await db.manyOrNone(sql, { subject });
    if (studyRequests.length === 0) {
      return studyRequests;
    }
    const studies = await StudyDAO.byStudyRequests(studyRequests);
    return studyRequests.map((studyRequest) => {
      const { id } = studyRequest;
      const studiesForRequest = studies.filter(({ studyRequestId }) => studyRequestId === id);
      return {
        ...studyRequest,
        studies: studiesForRequest,
      };
    });
  }

  /**
   * Fetch all study requests.
   *
   * @returns {Array<Object>} array of all study request objects
   */
  static async all() {
    const sql = `
SELECT
  "id",
  "createdAt",
  "userSubject",
  "status",
  "closed",
  "serviceRequestId",
  "priority",
  "assignedTo",
  "dueDate",
  "estimatedDeliveryDate",
  "reasons",
  "ccEmails",
  "centrelineId",
  "centrelineType",
  ST_AsGeoJSON("geom")::json AS "geom"
  FROM "study_requests"`;
    const studyRequests = await db.manyOrNone(sql);
    if (studyRequests.length === 0) {
      return studyRequests;
    }
    const studies = await StudyDAO.byStudyRequests(studyRequests);
    return studyRequests.map((studyRequest) => {
      const { id } = studyRequest;
      const studiesForRequest = studies.filter(({ studyRequestId }) => studyRequestId === id);
      return {
        ...studyRequest,
        studies: studiesForRequest,
      };
    });
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
    const sql = `
SELECT
  "id",
  "createdAt",
  "userSubject",
  "status",
  "closed",
  "serviceRequestId",
  "priority",
  "assignedTo",
  "dueDate",
  "estimatedDeliveryDate",
  "reasons",
  "ccEmails",
  "centrelineId",
  "centrelineType",
  ST_AsGeoJSON("geom")::json AS "geom"
  FROM "study_requests"
  WHERE "centrelineId" = $(centrelineId)
  AND "centrelineType" = $(centrelineType)`;
    const studyRequests = await db.manyOrNone(sql, { centrelineId, centrelineType });
    if (studyRequests.length === 0) {
      return studyRequests;
    }
    const studies = await StudyDAO.byStudyRequests(studyRequests);
    return studyRequests.map((studyRequest) => {
      const { id } = studyRequest;
      const studiesForRequest = studies.filter(({ studyRequestId }) => studyRequestId === id);
      return {
        ...studyRequest,
        studies: studiesForRequest,
      };
    });
  }

  /**
   * Create a row for the given study request in database.
   *
   * @param {Object} studyRequest - study request information, as submitted by frontend
   * @returns {Object} study request object, as persisted to database
   */
  static async create(studyRequest) {
    // TODO: validate that studyRequest hasn't already been persisted?
    const sql = `
INSERT INTO "study_requests" (
  "createdAt",
  "userSubject",
  "status",
  "closed",
  "serviceRequestId",
  "priority",
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
  $(userSubject),
  $(status),
  $(closed),
  $(serviceRequestId),
  $(priority),
  $(assignedTo),
  $(dueDate),
  $(estimatedDeliveryDate),
  $(reasons),
  $(ccEmails),
  $(centrelineId),
  $(centrelineType),
  ST_SetSRID(ST_GeomFromGeoJSON($(geom)), 4326)
) RETURNING "id"`;
    const createdAt = DateTime.local();
    const { id } = await db.one(sql, {
      createdAt,
      ...studyRequest,
    });
    const persistedStudyRequest = {
      id,
      createdAt,
      ...studyRequest,
    };
    const studyPromises = studyRequest.studies.map(
      study => StudyDAO.create(persistedStudyRequest, study),
    );
    persistedStudyRequest.studies = await Promise.all(studyPromises);
    return persistedStudyRequest;
  }

  /**
   * Updates the given study request.
   *
   * @param {Object} studyRequest - desired study request state
   * @returns {boolean} whether any rows were updated
   */
  static async update(studyRequest) {
    const studies = await StudyDAO.updateByStudyRequest(studyRequest);
    const sql = `
UPDATE "study_requests" SET
  "userSubject" = $(userSubject),
  "status" = $(status),
  "closed" = $(closed),
  "serviceRequestId" = $(serviceRequestId),
  "priority" = $(priority),
  "assignedTo" = $(assignedTo),
  "dueDate" = $(dueDate),
  "estimatedDeliveryDate" = $(estimatedDeliveryDate),
  "reasons" = $(reasons),
  "ccEmails" = $(ccEmails),
  "centrelineId" = $(centrelineId),
  "centrelineType" = $(centrelineType),
  "geom" = ST_SetSRID(ST_GeomFromGeoJSON($(geom)), 4326)
  WHERE "id" = $(id)`;
    await db.query(sql, studyRequest);
    return {
      ...studyRequest,
      studies,
    };
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
