import ArrayUtils from '@/lib/ArrayUtils';
import { setdefault } from '@/lib/MapUtils';
import db from '@/lib/db/db';
import StudyRequestDAO from '@/lib/db/StudyRequestDAO';
import StudyRequestItemDAO from '@/lib/db/StudyRequestItemDAO';
import Joi from '@/lib/model/Joi';
import StudyRequestBulk from '@/lib/model/StudyRequestBulk';
import DateTime from '@/lib/time/DateTime';

const STUDY_REQUESTS_BULK_FIELDS = `
  "id",
  "createdAt",
  "userId",
  "lastEditorId",
  "lastEditedAt",
  "ccEmails",
  "dueDate",
  "estimatedDeliveryDate",
  "name",
  "reason",
  "reasonOther",
  "s1",
  "selectionType",
  "urgent",
  "urgentReason"
  FROM "study_requests_bulk"`;

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
  "lastEditorId",
  "lastEditedAt",
  "ccEmails",
  "dueDate",
  "estimatedDeliveryDate",
  "name",
  "reason",
  "reasonOther",
  "s1",
  "selectionType",
  "urgent",
  "urgentReason"
) VALUES (
  $(createdAt),
  $(userId),
  $(lastEditorId),
  $(lastEditedAt),
  $(ccEmails),
  $(dueDate),
  $(estimatedDeliveryDate),
  $(name),
  $(reason),
  $(reasonOther),
  $(s1),
  $(selectionType),
  $(urgent),
  $(urgentReason)
) RETURNING "id"`;
    const { id: userId } = user;
    const persistedStudyRequestBulk = {
      createdAt: DateTime.local(),
      userId,
      lastEditorId: null,
      lastEditedAt: null,
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

  static async byLocationsSelectionPending(locationsSelection) {
    const sql = `
SELECT ${STUDY_REQUESTS_BULK_FIELDS}
WHERE "s1" = $(s1)
AND "selectionType" = $(selectionType)
ORDER BY "id" ASC`;
    const studyRequestsBulk = await db.manyOrNone(sql, locationsSelection);
    if (studyRequestsBulk.length === 0) {
      return studyRequestsBulk;
    }
    const studyRequestsPending = await StudyRequestDAO.byStudyRequestsBulkPending(
      studyRequestsBulk,
    );
    return normalizeStudyRequestsBulk(studyRequestsBulk, studyRequestsPending);
  }

  static async all() {
    const sql = `SELECT ${STUDY_REQUESTS_BULK_FIELDS}`;
    const studyRequestsBulk = await db.manyOrNone(sql);
    if (studyRequestsBulk.length === 0) {
      return studyRequestsBulk;
    }
    const studyRequests = await StudyRequestDAO.byStudyRequestsBulk(studyRequestsBulk);
    return normalizeStudyRequestsBulk(studyRequestsBulk, studyRequests);
  }

  static async update(studyRequestBulk, editor) {
    const sql = `
UPDATE "study_requests_bulk" SET
  "lastEditorId" = $(lastEditorId),
  "lastEditedAt" = $(lastEditedAt),
  "ccEmails" = $(ccEmails),
  "dueDate" = $(dueDate),
  "estimatedDeliveryDate" = $(estimatedDeliveryDate),
  "name" = $(name),
  "reason" = $(reason),
  "reasonOther" = $(reasonOther),
  "urgent" = $(urgent),
  "urgentReason" = $(urgentReason)
  WHERE "id" = $(id)`;
    const editedStudyRequestBulk = {
      ...studyRequestBulk,
      lastEditorId: editor.id,
      lastEditedAt: DateTime.local(),
    };
    await db.query(sql, editedStudyRequestBulk);

    const tasks = editedStudyRequestBulk.studyRequests.map(
      studyRequest => StudyRequestDAO.update(studyRequest, editor),
    );
    const editedStudyRequests = await Promise.all(tasks);
    editedStudyRequestBulk.studyRequests = ArrayUtils.sortBy(
      editedStudyRequests,
      ({ id: studyRequestId }) => studyRequestId,
    );

    await StudyRequestItemDAO.upsertByStudyRequestBulk(editedStudyRequestBulk);

    return StudyRequestBulk.read.validateAsync(editedStudyRequestBulk);
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
