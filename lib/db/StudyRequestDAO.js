const db = require('./db');

class StudyRequestDAO {
  static async byId(id) {
    const sql = 'SELECT * FROM "study_requests" WHERE "id" = $(id)';
    return db.oneOrNone(sql, { id });
  }

  static async byUser({ subject }) {
    const sql = 'SELECT * FROM "study_requests" WHERE "userSubject" = $(subject)';
    return db.manyOrNone(sql, { subject });
  }

  static async byCentreline(centrelineId, centrelineType) {
    const sql = `
SELECT * FROM "study_requests"
  WHERE "centrelineId" = $(centrelineId)
  AND "centrelineType" = $(centrelineType)`;
    return db.manyOrNone(sql, { centrelineId, centrelineType });
  }

  static async create(studyRequest) {
    const sql = `
INSERT INTO "study_requests" (
  "userId",
  "serviceRequestId",
  "priority",
  "dueDate",
  "reasons",
  "ccEmails",
  "centrelineId",
  "centrelineType",
  "geom"
) VALUES (
  $(userId),
  $(serviceRequestId),
  $(priority),
  $(dueDate),
  $(reasons),
  $(ccEmails),
  $(centrelineId),
  $(centrelineType),
  ST_GeomFromGeoJSON($(geom))
) RETURNING id, createdAt`;
    const result = db.one(sql, studyRequest);
    return {
      ...result,
      ...studyRequest,
    };
  }

  static async update(studyRequest) {
    const sql = `
UPDATE "study_requests" SET
  "serviceRequestId" = $(serviceRequestId),
  "priority" = $(priority),
  "dueDate" = $(dueDate),
  "reasons" = $(reasons),
  "ccEmails" = $(ccEmails),
  "centrelineId" = $(centrelineId),
  "centrelineType" = $(centrelineType),
  "geom" = ST_GeomFromGeoJSON($(geom))`;
    const rowsUpdated = await db.result(sql, studyRequest, r => r.rowCount);
    return rowsUpdated === 1;
  }

  static async delete({ id }) {
    const sql = 'DELETE FROM "study_requests" WHERE "id" = $(id)';
    const rowsDeleted = await db.result(sql, { id }, r => r.rowCount);
    return rowsDeleted === 1;
  }
}

module.exports = StudyRequestDAO;
