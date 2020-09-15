import ArrayUtils from '@/lib/ArrayUtils';
import db from '@/lib/db/db';
import StudyRequestDAO from '@/lib/db/StudyRequestDAO';
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

    return StudyRequestBulk.read.validateAsync(persistedStudyRequestBulk);
  }

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

  static async byLocationsSelection(locationsSelection) {
    const sql = `
SELECT ${STUDY_REQUESTS_BULK_FIELDS}
WHERE "s1" = $(s1)
AND "selectionType" = $(selectionType)
ORDER BY "id" ASC`;
    const studyRequestsBulk = await db.manyOrNone(sql, locationsSelection);
    const n = studyRequestsBulk.length;
    if (n === 0) {
      return studyRequestsBulk;
    }
    const studyRequests = await StudyRequestDAO.byStudyRequestsBulk(studyRequestsBulk);

    const studyRequestsByBulk = new Map();
    studyRequestsBulk.forEach(({ id }) => {
      studyRequestsByBulk.set(id, []);
    });
    studyRequests.forEach((studyRequest) => {
      const { studyRequestBulkId } = studyRequest;
      studyRequestsByBulk.get(studyRequestBulkId).push(studyRequest);
    });

    const studyRequestsBulkNormalized = studyRequestsBulk.map(studyRequestBulk => ({
      ...studyRequestBulk,
      studyRequests: studyRequestsByBulk.get(studyRequestBulk.id),
    }));
    const studyRequestsBulkSchema = Joi.array().items(StudyRequestBulk.read);
    return studyRequestsBulkSchema.validateAsync(studyRequestsBulkNormalized);
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

    return StudyRequestBulk.read.validateAsync(editedStudyRequestBulk);
  }

  static async delete(studyRequestBulk) {
    await StudyRequestDAO.deleteByStudyRequestBulk(studyRequestBulk);

    const sql = 'DELETE FROM "study_requests_bulk" WHERE "id" = $(id)';
    const studyRequestsBulkDeleted = await db.result(sql, studyRequestBulk, r => r.rowCount);
    return studyRequestsBulkDeleted === 1;
  }
}

export default StudyRequestBulkDAO;
