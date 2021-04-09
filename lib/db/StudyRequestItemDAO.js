import { StudyType } from '@/lib/Constants';
import db from '@/lib/db/db';

/**
 * Returns the SQL WHERE clauses that would match study requests against any of the
 * given `assignees`.  The list of allowed `assignees` can include the empty string
 * `''`, in which case unassigned requests (`"assignedTo" IS NULL`) are also matched.
 *
 * These clauses are combined with `OR`.
 *
 * @param {Array<StudyRequestAssignee|string>} assignees - list of allowed assignees
 */
function getStudyRequestFiltersAssignees(assignees) {
  const filters = [];
  const params = {};

  const assigneesNonNull = assignees.filter(assignee => assignee !== '');
  if (assigneesNonNull.length > 0) {
    params.assignees = assigneesNonNull;
    filters.push('"filterAssignedTo" && $(assignees)::VARCHAR[]');
  }

  /*
   * We have to handle the empty string / `NULL` case separately here, as PostgreSQL
   * handles `NULL` values differently from other values.  In particular,
   * `ARRAY[NULL]::int[] && ARRAY[NULL, 42]::int[]` evaluates to `FALSE`.
   */
  const hasNull = assignees.includes('');
  if (hasNull) {
    filters.push('array_position("filterAssignedTo", NULL) IS NOT NULL');
  }

  return { filters, params };
}

/**
 * Returns the SQL WHERE clause corresponding to text search on the given column.  We don't
 * use `tsvector` here, as that applies stop word and stemming logic that can be hard to reason
 * about.
 *
 * @param {string} column - column to perform text search on
 * @returns {string} SQL WHERE clause for text search on given column
 */
function getTextSearchFilter(column) {
  return `${column} ILIKE $(queryLike)`;
}

/**
 * Returns the SQL WHERE clauses for the given study request search query.
 *
 * These clauses are combined with `OR`.
 *
 * @param {string?} column - column to search on, or `null` to search on all searchable columns
 * at once
 * @param {string} query - search query
 * @returns {Array<string>} SQL WHERE clauses for search on given column(s)
 */
function getStudyRequestFiltersSearch(column, query) {
  const filtersSearch = [];
  if (column === null || column === 'ASSIGNED_TO') {
    filtersSearch.push(getTextSearchFilter('"searchAssignedTo"'));
  }
  if (column === null || column === 'ID') {
    // For ID searches, we expect an exact match.
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

/**
 * Returns SQL WHERE clauses and query parameters for the given study request query.
 *
 * These clauses are combined with `AND`.
 *
 * @param {Object} studyRequestQuery - query to match study requests on
 * @param {Object} user - user performing the query (for `userOnly` filter)
 */
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
    const {
      filters: filtersAssignees,
      params: paramsAssignees,
    } = getStudyRequestFiltersAssignees(assignees);
    Object.assign(params, paramsAssignees);
    const filtersAssignee = filtersAssignees.join(' OR ');
    filters.push(filtersAssignee);
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

/**
 * Returns the set of "sort keys", or database columns, to sort on given the value of `sortBy`.
 * `sortBy` is set by clicking one of the table header sorting arrows.
 *
 * In some cases, such as `LOCATION` or `REQUESTER`, we use `"sortDueDate"` as a secondary key
 * to handle duplicate sort key values.
 *
 * @param {string} sortBy - table column being sorted
 * @returns {Array<string>} list of database columns to sort on
 */
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

/**
 *
 * @param {Object} studyRequestQuery - query to match study requests on
 * @returns {string} SQL ORDER BY clause corresponding to `sortBy` / `sortDesc` values
 */
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
