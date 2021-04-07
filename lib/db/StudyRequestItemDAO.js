import db from '@/lib/db/db';
import StudyRequestDAO from '@/lib/db/StudyRequestDAO';
import StudyRequestBulkDAO from '@/lib/db/StudyRequestBulkDAO';

/*
function getStudyRequestFiltersSearch(column) {

}
*/

function getStudyRequestFilters(/* studyRequestQuery, user */) {
  const filters = [];
  const params = {};
  /*
  const {
    assignees,
    closed,
    column,
    createdAt,
    lastEditedAt,
    query,
    statuses,
    studyTypes,
    studyTypeOther,
    userOnly,
  } = studyRequestQuery;
  */

  // TODO: implement this

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
    let studyRequestFilters = '1 = 1';
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
}

export default StudyRequestItemDAO;
