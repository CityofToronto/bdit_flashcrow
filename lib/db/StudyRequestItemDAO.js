import {
  StudyRequestAssignee,
  StudyRequestStatus,
  StudyType,
} from '@/lib/Constants';
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
  if (sortBy === 'ASSIGNED_TO') {
    const enumCases = StudyRequestAssignee.enumValues
      .map(({ name, text }) => `WHEN '${name}' THEN '${text}'`);
    enumCases.push('ELSE \'Unassigned\'');
    const enumCasesStr = enumCases.join(' ');
    return [`CASE sr."assignedTo" ${enumCasesStr} END`];
  }
  if (sortBy === 'CREATED_AT') {
    return ['COALESCE(srb."createdAt", sr."createdAt")`'];
  }
  if (sortBy === 'DUE_DATE') {
    return ['COALESCE(srb."dueDate", sr."dueDate")'];
  }
  if (sortBy === 'ID') {
    return ['id'];
  }
  if (sortBy === 'LAST_EDITED_AT') {
    return ['"lastEditedAt"'];
  }
  if (sortBy === 'LOCATION') {
    throw new Error('not implemented');
  }
  if (sortBy === 'REQUESTER') {
    throw new Error('not implemented');
  }
  if (sortBy === 'STATUS') {
    const enumCases = StudyRequestStatus.enumValues
      .map(({ name, text }) => `WHEN '${name}' THEN '${text}'`);
    const enumCasesStr = enumCases.join(' ');
    return [`CASE sr."status" ${enumCasesStr} END`, '"dueDate"'];
  }
  if (sortBy === 'STUDY_TYPE') {
    const enumCases = StudyType.enumValues
      .map(({ label, name }) => `WHEN '${name}' THEN '${label}'`);
    const enumCasesStr = enumCases.join(' ');
    return [`CASE sr."studyType" ${enumCasesStr} END`, '"dueDate"'];
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
     *
     * We use `SELECT DISTINCT ON` to help pick out bulk requests that contain at least one
     * matching study request.
     */
    const { filters, params } = getStudyRequestFilters(studyRequestQuery, user);
    const studyRequestFilters = filters.join('\n  AND ');
    const studyRequestSort = getStudyRequestSort(studyRequestQuery);
    const { limit, offset } = studyRequestQuery;
    const sql = `
SELECT DISTINCT ON (COALESCE(-sr."studyRequestBulkId", sr.id))
  sr.id,
  sr."studyRequestBulkId"
FROM study_requests sr
LEFT JOIN study_requests_bulk srb ON sr."studyRequestBulkId" = srb.id
WHERE ${studyRequestFilters}
ORDER BY ${studyRequestSort}
LIMIT ${limit} OFFSET ${offset}`;
    const rows = db.manyOrNone(sql, params);

    /*
     * Once we know which bulk and non-bulk requests we're showing for this page, we then
     * fetch the full request objects of each type.
     *
     * TODO: return study request items (bulk and non-bulk)
     */
    const studyRequestIds = [];
    const studyRequestBulkIds = [];
    rows.forEach(({ id, studyRequestBulkId }) => {
      if (studyRequestBulkId !== null) {
        studyRequestBulkIds.push(studyRequestBulkId);
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
