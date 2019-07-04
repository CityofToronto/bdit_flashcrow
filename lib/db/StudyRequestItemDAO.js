const db = require('./db');

class StudyRequestItemDAO {
  static async byId(id) {
    const sql = `
SELECT "studyType", "daysOfWeek", "duration", "hours", "notes"
  FROM "study_request_items"
  WHERE "id" = $(id)`;
    return db.manyOrNone(sql, { id });
  }

  static async byStudyRequest({ id: studyRequestId }) {
    const sql = `
SELECT "studyType", "daysOfWeek", "duration", "hours", "notes"
  FROM "study_request_items"
  WHERE "studyRequestId" = $(studyRequestId)`;
    return db.manyOrNone(sql, { studyRequestId });
  }

  static async create(studyRequestItem) {
    const sql = `
INSERT INTO "study_request_items" (
  "studyType",
  "daysOfWeek",
  "duration",
  "hours",
  "notes"
) VALUES (
  $(studyType),
  $(daysOfWeek),
  $(duration),
  $(hours),
  $(notes)
) RETURNING id, createdAt`;
    const result = await db.one(sql, studyRequestItem);
    return {
      ...result,
      ...studyRequestItem,
    };
  }

  static async update(studyRequestItem) {
    const sql = `
UPDATE "study_request_items" SET
  "studyType" = $(studyType),
  "daysOfWeek" = $(daysOfWeek),
  "duration" = $(duration),
  "hours" = $(hours),
  "notes" = $(notes)`;
    const rowsUpdated = await db.result(sql, studyRequestItem, r => r.rowCount);
    return rowsUpdated === 1;
  }

  static async delete({ id }) {
    const sql = 'DELETE FROM "study_request_items" WHERE "id" = $(id)';
    const rowsDeleted = await db.result(sql, { id }, r => r.rowCount);
    return rowsDeleted === 1;
  }
}

module.exports = StudyRequestItemDAO;
