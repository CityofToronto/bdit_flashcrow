import ArrayUtils from '@/lib/ArrayUtils';
import { setdefault } from '@/lib/MapUtils';
import db from '@/lib/db/db';
import StudyRequestDAO from '@/lib/db/StudyRequestDAO';
import StudyRequestItemDAO from '@/lib/db/StudyRequestItemDAO';
import Joi from '@/lib/model/Joi';
import StudyRequestBulk from '@/lib/model/StudyRequestBulk';
import DateTime from '@/lib/time/DateTime';

const STUDY_REQUESTS_BULK_FIELDS = `
  srb."id",
  srb."createdAt",
  srb."userId",
  srb."ccEmails",
  srb."name",
  srb."notes"
  FROM "study_requests_bulk" srb`;

function normalizeStudyRequestsBulk(studyRequestsBulk, studyRequests) {
  const studyRequestsByBulk = new Map();
  studyRequests.forEach((studyRequest) => {
    const { studyRequestBulkId } = studyRequest;
    const studyRequestsForBulk = setdefault(
      studyRequestsByBulk,
      studyRequestBulkId,
      [],
    );
    studyRequestsForBulk.push(studyRequest);
  });

  const studyRequestsBulkNormalized = [];
  studyRequestsBulk.forEach((studyRequestBulk) => {
    if (!studyRequestsByBulk.has(studyRequestBulk.id)) {
      return;
    }
    const studyRequestsForBulk = studyRequestsByBulk.get(studyRequestBulk.id);
    studyRequestsBulkNormalized.push({
      ...studyRequestBulk,
      studyRequests: studyRequestsForBulk,
    });
  });

  const studyRequestsBulkSchema = Joi.array().items(StudyRequestBulk.read);
  return studyRequestsBulkSchema.validateAsync(studyRequestsBulkNormalized);
}

/**
 * Data Access Object for bulk study requests, which allow users to submit multiple related
 * study requests at once covering one or more locations.
 */
class StudyRequestBulkDAO {
  static async create(studyRequestBulk, user) {
    const sql = `
INSERT INTO "study_requests_bulk" (
  "createdAt",
  "userId",
  "ccEmails",
  "name",
  "notes"
) VALUES (
  $(createdAt),
  $(userId),
  $(ccEmails),
  $(name),
  $(notes)
) RETURNING "id"`;
    const { id: userId } = user;
    const persistedStudyRequestBulk = {
      createdAt: DateTime.local(),
      userId,
      ...studyRequestBulk,
    };
    const { id } = await db.one(sql, persistedStudyRequestBulk);
    persistedStudyRequestBulk.id = id;

    const tasks = persistedStudyRequestBulk.studyRequests.map(
      studyRequest => StudyRequestDAO.create({
        studyRequestBulkId: id,
        ...studyRequest,
      }, user),
    );
    const persistedStudyRequests = await Promise.all(tasks);
    persistedStudyRequestBulk.studyRequests = ArrayUtils.sortBy(
      persistedStudyRequests,
      ({ id: studyRequestId }) => studyRequestId,
    );

    await StudyRequestItemDAO.upsertByStudyRequestBulk(persistedStudyRequestBulk);

    return StudyRequestBulk.read.validateAsync(persistedStudyRequestBulk);
  }

  /**
   * Fetch the bulk study request with the given ID.
   *
   * @param {number} id - ID to fetch bulk study request for
   * @returns {Object} bulk study request object, or null if no such bulk study request exists
   */
  static async byId(id) {
    const sql = `SELECT ${STUDY_REQUESTS_BULK_FIELDS} WHERE "id" = $(id)`;
    const studyRequestBulk = await db.oneOrNone(sql, { id });
    if (studyRequestBulk === null) {
      return null;
    }
    const studyRequests = await StudyRequestDAO.byStudyRequestBulk(studyRequestBulk);
    studyRequestBulk.studyRequests = studyRequests;
    return StudyRequestBulk.read.validateAsync(studyRequestBulk);
  }

  static async nameById(id) {
    const sql = 'SELECT "name" FROM study_requests_bulk WHERE "id" = $(id)';
    const row = await db.oneOrNone(sql, { id });
    if (row === null) {
      return null;
    }
    return row.name;
  }

  static async byIds(ids) {
    if (ids.length === 0) {
      return [];
    }
    const sql = `SELECT ${STUDY_REQUESTS_BULK_FIELDS} WHERE "id" IN ($(ids:csv))`;
    const studyRequestsBulk = await db.manyOrNone(sql, { ids });
    if (studyRequestsBulk.length === 0) {
      return studyRequestsBulk;
    }
    const studyRequests = await StudyRequestDAO.byStudyRequestsBulk(studyRequestsBulk);
    return normalizeStudyRequestsBulk(studyRequestsBulk, studyRequests);
  }

  static async update(studyRequestBulk) {
    const sql = `
UPDATE "study_requests_bulk" SET
  "ccEmails" = $(ccEmails),
  "name" = $(name),
  "notes" = $(notes)
  WHERE "id" = $(id)`;
    const editedStudyRequestBulk = { ...studyRequestBulk };
    await db.query(sql, editedStudyRequestBulk);

    const tasks = editedStudyRequestBulk.studyRequests.map(StudyRequestDAO.update);
    const editedStudyRequests = await Promise.all(tasks);
    editedStudyRequestBulk.studyRequests = ArrayUtils.sortBy(
      editedStudyRequests,
      ({ id: studyRequestId }) => studyRequestId,
    );

    await StudyRequestItemDAO.upsertByStudyRequestBulk(editedStudyRequestBulk);

    return StudyRequestBulk.read.validateAsync(editedStudyRequestBulk);
  }

  /**
   * Assigns each of the given `studyRequests` to `studyRequestBulk`.  This can be used to add
   * existing study requests to a bulk study request, to move study requests between bulk study
   * requests, or to remove study requests from their bulk study request(s).
   *
   * @param {Array<Object>} studyRequests - study requests to update
   * @param {Object?} studyRequestBulk - bulk study request to assign study requests to,
   * or `null` if these are to be removed from their bulk study requests
   * @returns {Object?} if `studyRequestBulk !== null`, then the result of fetching
   * `studyRequestBulk` after these updates; otherwise `null`
   */
  static async setStudyRequestBulk(studyRequests, studyRequestBulk) {
    const studyRequestIds = [];
    let studyRequestBulkIds = new Set();
    studyRequests.forEach(({ id, studyRequestBulkId }) => {
      studyRequestIds.push(id);
      studyRequestBulkIds.add(studyRequestBulkId);
    });

    let studyRequestBulkId = null;
    if (studyRequestBulk !== null) {
      studyRequestBulkId = studyRequestBulk.id;
      studyRequestBulkIds.add(studyRequestBulkId);
    }
    studyRequestBulkIds = Array.from(studyRequestBulkIds);

    const sql = `
UPDATE "study_requests"
SET "studyRequestBulkId" = $(studyRequestBulkId)
WHERE "id" IN ($(studyRequestIds:csv))`;
    await db.query(sql, { studyRequestBulkId, studyRequestIds });

    const studyRequestsBulkToReindex = await StudyRequestBulkDAO.byIds(studyRequestBulkIds);
    const tasks = studyRequestsBulkToReindex.map(StudyRequestItemDAO.upsertByStudyRequestBulk);
    await Promise.all(tasks);

    if (studyRequestBulk === null) {
      return null;
    }
    return StudyRequestBulkDAO.byId(studyRequestBulkId);
  }

  static async delete(studyRequestBulk) {
    await StudyRequestDAO.deleteByStudyRequestBulk(studyRequestBulk);
    await StudyRequestItemDAO.deleteByStudyRequestBulk(studyRequestBulk);

    const sql = 'DELETE FROM "study_requests_bulk" WHERE "id" = $(id)';
    const studyRequestsBulkDeleted = await db.result(sql, studyRequestBulk, r => r.rowCount);
    return studyRequestsBulkDeleted === 1;
  }
}

export default StudyRequestBulkDAO;
