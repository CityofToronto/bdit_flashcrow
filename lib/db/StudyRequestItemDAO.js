import {
  StudyType,
} from '@/lib/Constants';
import { mapBy } from '@/lib/MapUtils';
import db from '@/lib/db/db';
import StudyRequestDAO from '@/lib/db/StudyRequestDAO';
import StudyRequestBulkDAO from '@/lib/db/StudyRequestBulkDAO';

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

    const studyRequestIds = [];
    const studyRequestBulkIds = [];
    rows.forEach(({ bulk, id }) => {
      if (bulk) {
        studyRequestBulkIds.push(id);
      } else {
        studyRequestIds.push(id);
      }
    });

    const [studyRequests, studyRequestsBulk] = await Promise.all([
      StudyRequestDAO.byIds(studyRequestIds),
      StudyRequestBulkDAO.byIds(studyRequestBulkIds),
    ]);
    const studyRequestsById = mapBy(studyRequests, ({ id }) => id);
    const studyRequestsBulkById = mapBy(studyRequestsBulk, ({ id }) => id);

    return rows.map(({ bulk, id }) => {
      const request = bulk ? studyRequestsBulkById.get(id) : studyRequestsById.get(id);
      return { bulk, request };
    });
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
