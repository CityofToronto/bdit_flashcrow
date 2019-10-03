import db from '@/lib/db/db';

/**
 * Data Access Object for studies, such as might be requested in the context of a
 * MOVE study request.
 *
 * For now, these are tied to study requests made using MOVE, but that might eventually
 * change to cover older studies submitted through legacy processes.
 */
class StudyDAO {
  /**
   * Fetch the study with the given ID.
   *
   * @param {number} id - ID to fetch study for
   * @returns {Object} study object, or null if no such study exists
   */
  static async byId(id) {
    const sql = 'SELECT * FROM "studies" WHERE "id" = $(id)';
    return db.manyOrNone(sql, { id });
  }

  /**
   * Fetch studies for the given study requests.
   *
   * @param {Array<Object>} studyRequests - study requests to fetch studies for
   * @returns {Array<Object>} studies that are part of any of the given study requests
   */
  static async byStudyRequests(studyRequests) {
    const ids = studyRequests.map(({ id }) => id);
    const sql = 'SELECT * FROM "studies" WHERE "studyRequestId" IN ($(ids:csv))';
    return db.manyOrNone(sql, { ids });
  }

  static async byCentreline(centrelineId, centrelineType) {
    const sql = `
SELECT
  s.*
  FROM "studies" s
  JOIN "study_requests" sr ON s."studyRequestId" = sr."id"
  WHERE sr."centrelineId" = $(centrelineId) AND sr."centrelineType" = $(centrelineType)`;
    return db.manyOrNone(sql, { centrelineId, centrelineType });
  }

  /**
   * Create a row for the given study in database.
   *
   * @param {Object} study - study information, as submitted by frontend
   * @returns {Object} study object, as persisted to database
   */
  static async create(study) {
    const sql = `
INSERT INTO "studies" (
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
    const result = await db.one(sql, study);
    return {
      ...result,
      ...study,
    };
  }

  /**
   * Updates the given study.
   *
   * @param {Object} study - desired study state
   * @returns {boolean} whether any rows were updated
   */
  static async update(study) {
    const sql = `
UPDATE "studies" SET
  "userSubject" = $(userSubject),
  "studyRequestId" = $(studyRequestId),
  "studyType" = $(studyType),
  "daysOfWeek" = $(daysOfWeek),
  "duration" = $(duration),
  "hours" = $(hours),
  "notes" = $(notes)`;
    const rowsUpdated = await db.result(sql, study, r => r.rowCount);
    return rowsUpdated === 1;
  }

  /**
   * Delete given study.
   *
   * @param {Object} study - study to delete
   * @param {number} study.id - ID of study to delete, used to identify it
   * @returns {boolean} whether any rows were deleted
   */
  static async delete({ id }) {
    const sql = 'DELETE FROM "studies" WHERE "id" = $(id)';
    const rowsDeleted = await db.result(sql, { id }, r => r.rowCount);
    return rowsDeleted === 1;
  }
}

export default StudyDAO;
