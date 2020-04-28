import db from '@/lib/db/db';
import Joi from '@/lib/model/Joi';
import StudyRequestComment from '@/lib/model/StudyRequestComment';
import DateTime from '@/lib/time/DateTime';

/**
 * Data Access Object for comments made on study requests submitted via MOVE.
 */
class StudyRequestCommentDAO {
  /**
   * Create a row for the given comment in database.
   *
   * @param {Object} comment - comment information, as submitted by frontend
   * @param {Object} studyRequest - study request to attach this comment to
   * @param {Object} user - user submitting this comment
   * @returns {Object} comment object, as persisted to database
   */
  static async create(comment, studyRequest, user) {
    const sql = `
INSERT INTO "study_request_comments" (
  "createdAt",
  "userId",
  "studyRequestId",
  "comment"
) VALUES (
  $(createdAt),
  $(userId),
  $(studyRequestId),
  $(comment)
) RETURNING "id"`;
    const { id: studyRequestId } = studyRequest;
    const { id: userId } = user;
    const persistedComment = {
      createdAt: DateTime.local(),
      userId,
      studyRequestId,
      ...comment,
    };
    const { id } = await db.one(sql, persistedComment);
    persistedComment.id = id;
    return StudyRequestComment.read.validateAsync(persistedComment);
  }

  /**
   * Fetch the comment with the given ID.
   *
   * @param {number} id - ID to fetch comment for
   * @returns {Object} comment object, or null if no such comment exists
   */
  static async byId(id) {
    const sql = 'SELECT * FROM "study_request_comments" WHERE "id" = $(id)';
    const comment = await db.oneOrNone(sql, { id });
    if (comment === null) {
      return null;
    }
    return StudyRequestComment.read.validateAsync(comment);
  }

  /**
   * Fetch all comments for the given study request.
   *
   * @param {Object} studyRequest - study request to fetch comments for
   * @returns {Object} comments that were made on the given study request
   */
  static async byStudyRequest(studyRequest) {
    const sql = `
SELECT * FROM "study_request_comments"
WHERE "studyRequestId" = $(studyRequestId)
ORDER BY "createdAt" DESC`;
    const { id: studyRequestId } = studyRequest;
    const comments = await db.manyOrNone(sql, { studyRequestId });
    const studyRequestCommentsSchema = Joi.array().items(StudyRequestComment.read);
    return studyRequestCommentsSchema.validateAsync(comments);
  }

  /**
   * Updates the given comment.
   *
   * @param {Object} comment - desired comment state
   * @returns {Object} updated comment state
   */
  static async update(comment) {
    const sql = `
UPDATE "study_request_comments" SET
  "comment" = $(comment)
WHERE "id" = $(id)`;
    await db.query(sql, comment);
    return StudyRequestComment.read.validateAsync(comment);
  }

  /**
   * Delete given comment.
   *
   * @param {Object} comment - comment to delete
   * @param {number} comment.id - ID of comment to delete, used to identify it
   * @returns {boolean} whether any rows were deleted
   */
  static async delete({ id }) {
    const sql = 'DELETE FROM "study_request_comments" WHERE "id" = $(id)';
    const rowsDeleted = await db.result(sql, { id }, r => r.rowCount);
    return rowsDeleted === 1;
  }

  /**
   * Delete all comments for the given study request.  This is intended for use
   * by `StudyRequestDAO.delete`.
   *
   * @see {StudyRequestDAO}
   * @param {Object} studyRequest - study request to delete comments for
   * @returns {boolean} whether any rows were deleted
   */
  static async deleteByStudyRequest(studyRequest) {
    const sql = `
DELETE FROM "study_request_comments"
WHERE "studyRequestId" = $(studyRequestId)`;
    const { id: studyRequestId } = studyRequest;
    const rowsDeleted = await db.result(sql, { studyRequestId }, r => r.rowCount);
    return rowsDeleted > 0;
  }
}

export default StudyRequestCommentDAO;
