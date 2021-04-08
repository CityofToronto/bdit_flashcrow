import { StudyType } from '@/lib/Constants';
import db from '@/lib/db/db';

function getTextSearchFilter(column) {
  return `${column} ILIKE $(queryLike)`;
}

function getStudyRequestFiltersSearch(column, query) {
  const filtersSearch = [];
  if (column === null || column === 'ASSIGNED_TO') {
    filtersSearch.push(getTextSearchFilter('"searchAssignedTo"'));
  }
  if (column === null || column === 'ID') {
    if (Number.isNaN(parseInt(query, 10))) {
      filtersSearch.push('FALSE');
    } else {
      filtersSearch.push('$(query) = ANY ("searchId")');
    }
  }
  if (column === null || column === 'LOCATION') {
    filtersSearch.push(getTextSearchFilter('"searchLocation"'));
  }
  if (column === null || column === 'REQUESTER') {
    filtersSearch.push(getTextSearchFilter('"searchRequester"'));
  }
  if (column === null || column === 'STATUS') {
    filtersSearch.push(getTextSearchFilter('"searchStatus"'));
  }
  if (column === null || column === 'STUDY_TYPE') {
    filtersSearch.push(getTextSearchFilter('"searchStudyType"'));
  }
  return filtersSearch;
}

function getStudyRequestFilters(studyRequestQuery, user) {
  const filters = [];
  const params = {};
  const {
    assignees,
    column,
    query,
    statuses,
    studyTypes,
    studyTypeOther,
    userOnly,
  } = studyRequestQuery;
  if (assignees.length > 0) {
    params.assignees = assignees;
    filters.push('"filterAssignedTo" && $(assignees)::VARCHAR[]');
  }
  if (query !== null) {
    params.query = query;
    params.queryLike = `%${query}%`;
    const filtersSearch = getStudyRequestFiltersSearch(column, query);
    const filterSearch = filtersSearch.join(' OR ');
    filters.push(`(${filterSearch})`);
  }
  if (statuses.length > 0) {
    params.statuses = statuses;
    filters.push('"filterStatus" && $(statuses)::VARCHAR[]');
  }
  const studyTypesFull = [...studyTypes];
  if (studyTypeOther) {
    studyTypesFull.push(
      ...StudyType.enumValues.filter(({ other }) => other),
    );
  }
  if (studyTypesFull.length > 0) {
    params.studyTypes = studyTypesFull;
    filters.push('"filterStudyType" && $(studyTypes)::VARCHAR[]');
  }
  if (userOnly) {
    params.userId = user.id;
    filters.push('"filterUserId" = $(userId)');
  }
  return { filters, params };
}

function getStudyRequestSortKeys(sortBy) {
  if (sortBy === 'CREATED_AT') {
    return ['"sortCreatedAt"'];
  }
  if (sortBy === 'DUE_DATE') {
    return ['"sortDueDate"'];
  }
  if (sortBy === 'ID') {
    return ['"sortId"'];
  }
  if (sortBy === 'LOCATION') {
    return ['"sortLocation"', '"sortDueDate"'];
  }
  if (sortBy === 'REQUESTER') {
    return ['"sortRequester"', '"sortDueDate"'];
  }
  throw new Error(`invalid sortBy: ${sortBy}`);
}

function getStudyRequestSort(studyRequestQuery) {
  const { sortBy, sortDesc } = studyRequestQuery;
  const sortKeys = getStudyRequestSortKeys(sortBy);
  const sortDir = sortDesc ? 'DESC' : 'ASC';
  return sortKeys
    .map(sortKey => `${sortKey} ${sortDir}`)
    .join(', ');
}

/**
 * Data Access Object for study request items, which are used in Track Requests to show study
 * requests together with related location and requester metadata.
 */
class StudyRequestItemDAO {
  // UPSERT

  static async upsertByStudyRequest(studyRequest) {
    const sql = `
INSERT INTO study_request_items (
  SELECT
    FALSE AS bulk,
    sr."id",
    ARRAY[sr."assignedTo"] AS "filterAssignedTo",
    ARRAY[sr."status"] AS "filterStatus",
    ARRAY[sr."studyType"] AS "filterStudyType",
    sr."userId" AS "filterUserId",
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

  static async upsertByStudyRequestBulk(studyRequestBulk) {
    const sql = `
INSERT INTO study_request_items (
  WITH bulk_agg AS (
    SELECT
      srb.id,
      array_agg(DISTINCT(sr."assignedTo")) AS "filterAssignedTo",
      array_agg(DISTINCT(sr."status")) AS "filterStatus",
      array_agg(DISTINCT(sr."studyType")) AS "filterStudyType",
      array_to_string(array_agg(DISTINCT(COALESCE(sr."assignedTo", 'Unassigned'))), '|') AS "searchAssignedTo",
      array_agg(sr.id) AS "searchId",
      array_to_string(srb.name::text || array_agg(DISTINCT(lsc."description")), '|') AS "searchLocation",
      array_to_string(array_agg(DISTINCT(sr."status")), '|') AS "searchStatus",
      array_to_string(array_agg(DISTINCT(sr."studyType")), '|') AS "searchStudyType",
      srb."createdAt" AS "sortCreatedAt",
      srb."dueDate" AS "sortDueDate",
      max(sr.id) AS "sortId"
    FROM study_requests_bulk srb
    JOIN study_requests sr ON srb.id = sr."studyRequestBulkId"
    LEFT JOIN location_search.centreline lsc USING ("centrelineType", "centrelineId")
    WHERE srb.id = $(id)
    GROUP BY srb.id
  )
  SELECT
    TRUE AS bulk,
    ba.id,
    ba."filterAssignedTo",
    ba."filterStatus",
    ba."filterStudyType",
    srb."userId" AS "filterUserId",
    ba."searchAssignedTo",
    ba."searchId",
    ba."searchLocation",
    u."uniqueName" AS "searchRequester",
    ba."searchStatus",
    ba."searchStudyType",
    ba."sortCreatedAt",
    ba."sortDueDate",
    ba."sortId",
    srb."name" AS "sortLocation",
    u."uniqueName" AS "sortRequester"
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
   */
  static async byQuery(studyRequestQuery, user) {
    /*
     * First, we apply filter, search, sort, and pagination parameters to get the correct
     * page of study requests (bulk and non-bulk).
     */
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

  static async byQueryTotal(studyRequestQuery, user) {
    const { filters, params } = getStudyRequestFilters(studyRequestQuery, user);
    let studyRequestFilters = '1 = 1';
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

  static async deleteByStudyRequest(studyRequest) {
    const sql = 'DELETE FROM "study_request_items" WHERE id = $(id) AND NOT bulk';
    const studyRequestItemsDeleted = await db.result(sql, studyRequest, r => r.rowCount);
    return studyRequestItemsDeleted === 1;
  }

  static async deleteByStudyRequestBulk(studyRequestBulk) {
    const sql = 'DELETE FROM "study_request_items" WHERE id = $(id) AND bulk';
    const studyRequestItemsDeleted = await db.result(sql, studyRequestBulk, r => r.rowCount);
    return studyRequestItemsDeleted === 1;
  }
}

export default StudyRequestItemDAO;
