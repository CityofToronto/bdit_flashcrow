const db = require('./db');

/**
 * Data Access Object for "study request items", which represent individual studies
 * within a study request.
 */
class StudyDAO {
  /**
   * Fetch the study request item with the given ID.
   *
   * @param {number} id - ID to fetch study request item for
   * @returns {Object} study request item object, or null if no such study request item exists
   */
  static async byId(id) {
    const sql = `
SELECT
  "id",
  "createdAt",
  "userSubject",
  "studyRequestId",
  "studyType",
  "daysOfWeek",
  "duration",
  "hours",
  "notes"
  FROM "study_request_items"
  WHERE "id" = $(id)`;
    return db.manyOrNone(sql, { id });
  }

  /**
   * Fetch items for the given study request.
   *
   * @param {Object} studyRequest - study request to fetch items for
   * @param {number} studyRequest.id - ID of study request
   * @returns {Object} study request item objects for given study request
   */
  static async byStudyRequest({ id: studyRequestId }) {
    const sql = `
SELECT
  "id",
  "createdAt",
  "userSubject",
  "studyRequestId",
  "studyType",
  "daysOfWeek",
  "duration",
  "hours",
  "notes"
  FROM "study_request_items"
  WHERE "studyRequestId" = $(studyRequestId)`;
    return db.manyOrNone(sql, { studyRequestId });
  }

  /**
   * Create a row for the given study request item in database.
   *
   * @param {Object} studyRequestItem - study request item information, as submitted by frontend
   * @returns {Object} study request item object, as persisted to database
   */
  static async create(studyRequestItem) {
    const sql = `
INSERT INTO "study_request_items" (
  "userSubject",
  "studyRequestId",
  "studyType",
  "daysOfWeek",
  "duration",
  "hours",
  "notes"
) VALUES (
  $(userSubject),
  $(studyRequestId),
  $(studyType),
  $(daysOfWeek),
  $(duration),
  $(hours),
  $(notes)
) RETURNING "id", "createdAt"`;
    const result = await db.one(sql, studyRequestItem);
    return {
      ...result,
      ...studyRequestItem,
    };
  }

  /**
   * Updates the given study request item.
   *
   * @param {Object} studyRequest - desired study request item state
   * @returns {boolean} whether any rows were updated
   */
  static async update(studyRequestItem) {
    const sql = `
UPDATE "study_request_items" SET
  "userSubject" = $(userSubject),
  "studyRequestId" = $(studyRequestId),
  "studyType" = $(studyType),
  "daysOfWeek" = $(daysOfWeek),
  "duration" = $(duration),
  "hours" = $(hours),
  "notes" = $(notes)`;
    const rowsUpdated = await db.result(sql, studyRequestItem, r => r.rowCount);
    return rowsUpdated === 1;
  }

  /**
   * Delete given study request item.
   *
   * @param {Object} studyRequest - study request item to delete
   * @param {number} studyRequest.id - ID of study request item to delete, used to identify it
   * @returns {boolean} whether any rows were deleted
   */
  static async delete({ id }) {
    const sql = 'DELETE FROM "study_request_items" WHERE "id" = $(id)';
    const rowsDeleted = await db.result(sql, { id }, r => r.rowCount);
    return rowsDeleted === 1;
  }
}

module.exports = StudyDAO;
