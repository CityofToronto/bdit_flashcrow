const db = require('./db');

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
  "serviceRequestId",
  "priority",
  "dueDate",
  "estimatedDeliveryDate",
  "reasons",
  "ccEmails",
  "centrelineId",
  "centrelineType",
  ST_AsGeoJSON("geom")::json AS "geom"
  FROM "study_requests" WHERE "id" = $(id)`;
    return db.oneOrNone(sql, { id });
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
  "serviceRequestId",
  "priority",
  "dueDate",
  "estimatedDeliveryDate",
  "reasons",
  "ccEmails",
  "centrelineId",
  "centrelineType",
  ST_AsGeoJSON("geom")::json AS "geom"
  FROM "study_requests" WHERE "userSubject" = $(subject)`;
    return db.manyOrNone(sql, { subject });
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
  "serviceRequestId",
  "priority",
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
    return db.manyOrNone(sql, { centrelineId, centrelineType });
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
  "userSubject",
  "status",
  "serviceRequestId",
  "priority",
  "dueDate",
  "estimatedDeliveryDate",
  "reasons",
  "ccEmails",
  "centrelineId",
  "centrelineType",
  "geom"
) VALUES (
  $(userSubject),
  $(status),
  $(serviceRequestId),
  $(priority),
  $(dueDate),
  $(estimatedDeliveryDate),
  $(reasons),
  $(ccEmails),
  $(centrelineId),
  $(centrelineType),
  ST_SetSRID(ST_GeomFromGeoJSON($(geom)), 4326)
) RETURNING "id", "createdAt"`;
    const result = await db.one(sql, studyRequest);
    return {
      ...result,
      ...studyRequest,
    };
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
  "userSubject" = $(userSubject),
  "status" = $(status),
  "serviceRequestId" = $(serviceRequestId),
  "priority" = $(priority),
  "dueDate" = $(dueDate),
  "estimatedDeliveryDate" = $(estimatedDeliveryDate),
  "reasons" = $(reasons),
  "ccEmails" = $(ccEmails),
  "centrelineId" = $(centrelineId),
  "centrelineType" = $(centrelineType),
  "geom" = ST_SetSRID(ST_GeomFromGeoJSON($(geom)), 4326)
  WHERE "id" = $(id)`;
    const rowsUpdated = await db.result(sql, studyRequest, r => r.rowCount);
    return rowsUpdated === 1;
  }

  /**
   * Delete given study request.
   *
   * @param {Object} studyRequest - study request to delete
   * @param {number} studyRequest.id - ID of study request to delete, used to identify it
   * @returns {boolean} whether any rows were deleted
   */
  static async delete({ id }) {
    const sql = 'DELETE FROM "study_requests" WHERE "id" = $(id)';
    const rowsDeleted = await db.result(sql, { id }, r => r.rowCount);
    return rowsDeleted === 1;
  }
}

module.exports = StudyRequestDAO;
