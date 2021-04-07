import {
  StudyType,
} from '@/lib/Constants';
import db from '@/lib/db/db';
import StudyRequestDAO from '@/lib/db/StudyRequestDAO';
import StudyRequestBulkDAO from '@/lib/db/StudyRequestBulkDAO';

function getStudyRequestFiltersSearch(column, query) {
  const filtersSearch = [];
  if (column === null || column === 'ASSIGNED_TO') {
    filtersSearch.push('"searchAssignedTo" ILIKE $(queryLike)');
  }
  if (column === null || column === 'ID') {
    if (Number.isNaN(parseInt(query, 10))) {
      filtersSearch.push('FALSE');
    } else {
      filtersSearch.push('$(query) = ANY ("searchId")');
    }
  }
  if (column === null || column === 'REQUESTER') {
    filtersSearch.push('"searchRequester" ILIKE $(queryLike)');
  }
  if (column === null || column === 'STATUS') {
    filtersSearch.push('"searchStatus" ILIKE $(queryLike)');
  }
  if (column === null || column === 'STUDY_TYPE') {
    filtersSearch.push('"searchStudyType" ILIKE $(queryLike)');
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
    const rows = await db.manyOrNone(sqlItems, params);

    /*
     * Once we know which bulk and non-bulk requests we're showing for this page, we then
     * fetch the full request objects of each type.
     *
     * TODO: return study request items (bulk and non-bulk)
     */
    const studyRequestIds = [];
    const studyRequestBulkIds = [];
    rows.forEach(({ bulk, id }) => {
      if (bulk) {
        studyRequestBulkIds.push(id);
      } else {
        studyRequestIds.push(id);
      }
    });
    const studyRequests = await StudyRequestDAO.byIds(studyRequestIds);
    // TODO: fetch only matching study requests within bulk requests
    const studyRequestsBulk = await StudyRequestBulkDAO.byIds(studyRequestBulkIds);
    return {
      studyRequests,
      studyRequestsBulk,
    };
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
}

export default StudyRequestItemDAO;
