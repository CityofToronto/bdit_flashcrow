import { StudyType } from '@/lib/Constants';

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
    createdAtEnd,
    createdAtStart,
    dueDateEnd,
    dueDateStart,
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
  if (createdAtStart !== null) {
    params.createdAtStart = createdAtStart;
    filters.push('"sortCreatedAt" >= $(createdAtStart)');
  }
  if (createdAtEnd !== null) {
    params.createdAtEnd = createdAtEnd;
    filters.push('"sortCreatedAt" < $(createdAtEnd)');
  }
  if (dueDateStart !== null) {
    params.dueDateStart = dueDateStart;
    filters.push('"sortDueDate" >= $(dueDateStart)');
  }
  if (dueDateEnd !== null) {
    params.dueDateEnd = dueDateEnd;
    filters.push('"sortDueDate" < $(dueDateEnd)');
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
 * @namespace
 */
const StudyRequestFiltersSql = {
  getStudyRequestFilters,
  getStudyRequestSort,
};

export {
  StudyRequestFiltersSql as default,
  getStudyRequestFilters,
  getStudyRequestSort,
};