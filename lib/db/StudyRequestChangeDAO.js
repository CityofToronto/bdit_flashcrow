import db from '@/lib/db/db';
import Joi from '@/lib/model/Joi';
import StudyRequestChange from '@/lib/model/StudyRequestChange';
import DateTime from '@/lib/time/DateTime';

/**
 * Data Access Object for status changes made to study requests submitted
 * via MOVE.
 *
 * These changes are logged automatically by MOVE as users submit actions that
 * change the status of study requests.
 */
class StudyRequestChangeDAO {
  /**
   * @param {Object} studyRequest - study request that was changed
   * @param {Object} user - user who made this change
   * @returns {Object} change object, as persisted to database
   */
  static async create(studyRequest, user) {
    const sql = `
INSERT INTO "study_request_changes" (
  "createdAt",
  "userId",
  "studyRequestId",
  "status"
) VALUES (
  $(createdAt),
  $(userId),
  $(studyRequestId),
  $(status)
) RETURNING "id"`;
    const { id: studyRequestId, status } = studyRequest;
    const { id: userId } = user;
    const persistedChange = {
      createdAt: DateTime.local(),
      userId,
      studyRequestId,
      status,
    };
    const { id } = await db.one(sql, persistedChange);
    persistedChange.id = id;
    return StudyRequestChange.read.validateAsync(persistedChange);
  }

  /**
   * Fetch the change with the given ID.
   *
   * @param {number} id - ID to fetch change for
   * @returns {Object} change object, or null if no such change exists
   */
  static async byId(id) {
    const sql = 'SELECT * FROM "study_request_changes" WHERE "id" = $(id)';
    const change = await db.oneOrNone(sql, { id });
    if (change === null) {
      return null;
    }
    return StudyRequestChange.read.validateAsync(change);
  }

  /**
   * Fetch all changes for the given study request.
   *
   * @param {Object} studyRequest - study request to fetch changes for
   * @returns {Object} changes object, or null if no such change exists
   */
  static async byStudyRequest(studyRequest) {
    const sql = `
SELECT * FROM "study_request_changes"
WHERE "studyRequestId" = $(studyRequestId)
ORDER BY "createdAt" DESC`;
    const { id: studyRequestId } = studyRequest;
    const changes = await db.manyOrNone(sql, { studyRequestId });
    const studyRequestChangesSchema = Joi.array().items(StudyRequestChange.read);
    return studyRequestChangesSchema.validateAsync(changes);
  }

  /**
   * Delete all changes for the given study request.  This is intended for use
   * by `StudyRequestDAO.delete`.
   *
   * @see {StudyRequestDAO}
   * @param {Object} studyRequest - study request to delete changes for
   * @returns {boolean} whether any rows were deleted
   */
  static async deleteByStudyRequest(studyRequest) {
    const sql = `
DELETE FROM "study_request_changes"
WHERE "studyRequestId" = $(studyRequestId)`;
    const { id: studyRequestId } = studyRequest;
    const rowsDeleted = await db.result(sql, { studyRequestId }, r => r.rowCount);
    return rowsDeleted > 0;
  }
}

export default StudyRequestChangeDAO;
