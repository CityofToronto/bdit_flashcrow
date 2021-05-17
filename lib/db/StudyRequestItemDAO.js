import db from '@/lib/db/db';
import {
  getStudyRequestFilters,
  getStudyRequestSort,
} from '@/lib/db/filters/StudyRequestFiltersSql';

/**
 * @typedef {Object} StudyRequestItemKey
 * @property {boolean} bulk - does this key represent a bulk study request?
 * @property {number} id - ID of the given study request (bulk or non-bulk)
 */

/**
 * Data Access Object for study request items, which are used in Track Requests to show study
 * requests together with related location and requester metadata.
 */
class StudyRequestItemDAO {
  // UPSERT

  /**
   * Upserts the study request item corresponding to the given study request.  This is used
   * to create new study request item records for newly created study requests, as well as to
   * update study request item records for newly updated study requests.
   *
   * This is called by `StudyRequestDAO` to ensure study request item records remain in sync
   * with study requests.
   *
   * @param {Object} studyRequest - newly created or updated study request
   */
  static async upsertByStudyRequest(studyRequest) {
    const sql = `
INSERT INTO study_request_items (
  SELECT
    FALSE AS bulk,
    sr."id",
    ARRAY[sr."assignedTo"] AS "filterAssignedTo",
    ARRAY[sr."status"] AS "filterStatus",
    ARRAY[sr."studyType"] AS "filterStudyType",
    ARRAY[sr."userId"] AS "filterUserId",
    sr."assignedTo" AS "searchAssignedTo",
    ARRAY[sr."id"] AS "searchId",
    lsc."description" AS "searchLocation",
    u."uniqueName" AS "searchRequester",
    sr."status" AS "searchStatus",
    sr."studyType" AS "searchStudyType",
    sr."createdAt" AS "sortCreatedAt",
    sr."dueDate" AS "sortDueDate",
    sr."id" AS "sortId",
    lsc."description" AS "sortLocation",
    u."uniqueName" AS "sortRequester"
  FROM study_requests sr
  LEFT JOIN location_search.centreline lsc USING ("centrelineType", "centrelineId")
  LEFT JOIN users u ON sr."userId" = u.id
  WHERE "studyRequestBulkId" IS NULL AND sr."id" = $(id)
)
ON CONFLICT (bulk, id) DO UPDATE SET
  "filterAssignedTo" = EXCLUDED."filterAssignedTo",
  "filterStatus" = EXCLUDED."filterStatus",
  "filterStudyType" = EXCLUDED."filterStudyType",
  "filterUserId" = EXCLUDED."filterUserId",
  "searchAssignedTo" = EXCLUDED."searchAssignedTo",
  "searchId" = EXCLUDED."searchId",
  "searchLocation" = EXCLUDED."searchLocation",
  "searchRequester" = EXCLUDED."searchRequester",
  "searchStatus" = EXCLUDED."searchStatus",
  "searchStudyType" = EXCLUDED."searchStudyType",
  "sortCreatedAt" = EXCLUDED."sortCreatedAt",
  "sortDueDate" = EXCLUDED."sortDueDate",
  "sortId" = EXCLUDED."sortId",
  "sortLocation" = EXCLUDED."sortLocation",
  "sortRequester" = EXCLUDED."sortRequester"`;
    await db.query(sql, studyRequest);
  }

  /**
   * Upserts the study request item corresponding to the given bulk study request.  This is used
   * to create new study request item records for newly created bulk study requests, as well as to
   * update study request item records for newly updated bulk study requests.
   *
   * This is called by `StudyRequestBulkDAO` to ensure study request item records remain in sync
   * with bulk study requests.
   *
   * @param {Object} studyRequestBulk - newly created or updated bulk study request
   */
  static async upsertByStudyRequestBulk(studyRequestBulk) {
    const sql = `
INSERT INTO study_request_items (
  WITH bulk_agg AS (
    SELECT
      srb.id,
      array_agg(DISTINCT(sr."assignedTo")) AS "filterAssignedTo",
      array_agg(DISTINCT(sr."status")) AS "filterStatus",
      array_agg(DISTINCT(sr."studyType")) AS "filterStudyType",
      array_agg(DISTINCT(sr."userId")) AS "filterUserId",
      array_to_string(array_agg(DISTINCT(COALESCE(sr."assignedTo", 'Unassigned'))), '|') AS "searchAssignedTo",
      array_agg(sr.id) AS "searchId",
      array_to_string(srb.name::text || array_agg(DISTINCT(lsc."description")), '|') AS "searchLocation",
      array_to_string(array_agg(DISTINCT(u."uniqueName")), '|') AS "searchRequester",
      array_to_string(array_agg(DISTINCT(sr."status")), '|') AS "searchStatus",
      array_to_string(array_agg(DISTINCT(sr."studyType")), '|') AS "searchStudyType",
      min(sr."createdAt") AS "sortCreatedAt",
      min(sr."dueDate") AS "sortDueDate",
      max(sr.id) AS "sortId",
      mode() WITHIN GROUP (ORDER BY u."uniqueName") AS "sortRequester"
    FROM study_requests_bulk srb
    JOIN study_requests sr ON srb.id = sr."studyRequestBulkId"
    LEFT JOIN location_search.centreline lsc USING ("centrelineType", "centrelineId")
    LEFT JOIN users u ON sr."userId" = u.id
    WHERE srb.id = $(id)
    GROUP BY srb.id
  )
  SELECT
    TRUE AS bulk,
    ba.id,
    ba."filterAssignedTo",
    ba."filterStatus",
    ba."filterStudyType",
    ba."filterUserId",
    ba."searchAssignedTo",
    ba."searchId",
    ba."searchLocation",
    ba."searchRequester",
    ba."searchStatus",
    ba."searchStudyType",
    ba."sortCreatedAt",
    ba."sortDueDate",
    ba."sortId",
    srb."name" AS "sortLocation",
    ba."sortRequester"
  FROM bulk_agg ba
  JOIN study_requests_bulk srb ON ba.id = srb.id
  JOIN users u ON srb."userId" = u.id
  WHERE srb."id" = $(id)
)
ON CONFLICT (bulk, id) DO UPDATE SET
  "filterAssignedTo" = EXCLUDED."filterAssignedTo",
  "filterStatus" = EXCLUDED."filterStatus",
  "filterStudyType" = EXCLUDED."filterStudyType",
  "filterUserId" = EXCLUDED."filterUserId",
  "searchAssignedTo" = EXCLUDED."searchAssignedTo",
  "searchId" = EXCLUDED."searchId",
  "searchLocation" = EXCLUDED."searchLocation",
  "searchRequester" = EXCLUDED."searchRequester",
  "searchStatus" = EXCLUDED."searchStatus",
  "searchStudyType" = EXCLUDED."searchStudyType",
  "sortCreatedAt" = EXCLUDED."sortCreatedAt",
  "sortDueDate" = EXCLUDED."sortDueDate",
  "sortId" = EXCLUDED."sortId",
  "sortLocation" = EXCLUDED."sortLocation",
  "sortRequester" = EXCLUDED."sortRequester"`;
    await db.query(sql, studyRequestBulk);
  }

  /**
   *
   * @param {Object} studyRequestQuery - query representing filter, search, sort, and
   * pagination parameters
   * @param {Object} user - user making the query; used for the `userOnly` filter
   * @returns {Array<StudyRequestItemKey>} paginated items matching the given query
   */
  static async byQuery(studyRequestQuery, user) {
    const { filters, params } = getStudyRequestFilters(studyRequestQuery, user);
    let studyRequestFilters = 'TRUE';
    if (filters.length > 0) {
      studyRequestFilters = filters.join('\n  AND ');
    }
    const studyRequestSort = getStudyRequestSort(studyRequestQuery);
    const { limit, offset } = studyRequestQuery;
    const sqlItems = `
SELECT bulk, id
FROM study_request_items
WHERE ${studyRequestFilters}
ORDER BY ${studyRequestSort}
LIMIT ${limit} OFFSET ${offset}`;
    return db.manyOrNone(sqlItems, params);
  }

  /**
   *
   * @param {Object} studyRequestQuery - query representing filter, search, sort, and
   * pagination parameters
   * @param {Object} user - user making the query; used for the `userOnly` filter
   * @returns {number} total number of requests matching the query
   */
  static async byQueryTotal(studyRequestQuery, user) {
    const { filters, params } = getStudyRequestFilters(studyRequestQuery, user);
    let studyRequestFilters = 'TRUE';
    if (filters.length > 0) {
      studyRequestFilters = filters.join('\n  AND ');
    }
    const sqlItems = `
SELECT COUNT(*) AS total
FROM study_request_items
WHERE ${studyRequestFilters}`;
    const { total } = await db.one(sqlItems, params);
    return total;
  }

  // DELETE

  /**
   * Deletes the study request item corresponding to the given study request.  This is used
   * to delete study request item records for study requests that are about to be deleted.
   *
   * This is called by `StudyRequestDAO` to ensure study request item records remain in sync
   * with study requests.
   *
   * @param {Object} studyRequest - study request that will be deleted
   */
  static async deleteByStudyRequest(studyRequest) {
    const sql = 'DELETE FROM "study_request_items" WHERE id = $(id) AND NOT bulk';
    const studyRequestItemsDeleted = await db.result(sql, studyRequest, r => r.rowCount);
    return studyRequestItemsDeleted === 1;
  }

  /**
   * Deletes the study request item corresponding to the given bulk study request.  This is used
   * to delete study request item records for bulk study requests that are about to be deleted.
   *
   * This is called by `StudyRequestDAO` to ensure study request item records remain in sync
   * with study requests.
   *
   * @param {Object} studyRequestBulk - bulk study request that will be deleted
   */
  static async deleteByStudyRequestBulk(studyRequestBulk) {
    const sql = 'DELETE FROM "study_request_items" WHERE id = $(id) AND bulk';
    const studyRequestItemsDeleted = await db.result(sql, studyRequestBulk, r => r.rowCount);
    return studyRequestItemsDeleted === 1;
  }
}

export default StudyRequestItemDAO;
