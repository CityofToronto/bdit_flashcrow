import { StudyType } from '@/lib/Constants';
import RequestSearchKeys from '@/lib/requests/RequestSearchKeys';
import { ItemType } from '@/lib/requests/RequestStudyBulkUtils';
import DateTime from '@/lib/time/DateTime';

function filtersMatchStudyRequest(filters, user, studyRequest) {
  const {
    assignees,
    closed,
    createdAt,
    lastEditedAt,
    statuses,
    studyTypes,
    studyTypeOther,
    userOnly,
  } = filters;
  const now = DateTime.local();

  if (assignees.length > 0 && !assignees.includes(studyRequest.assignedTo)) {
    return false;
  }
  if (closed && !studyRequest.closed) {
    return false;
  }
  if (createdAt < 0) {
    const after = now.minus({ months: -createdAt });
    if (studyRequest.createdAt.valueOf() <= after.valueOf()) {
      return false;
    }
  }
  if (createdAt > 0) {
    const before = now.minus({ months: createdAt });
    if (studyRequest.createdAt.valueOf() > before.valueOf()) {
      return false;
    }
  }
  if (lastEditedAt !== 0 && studyRequest.lastEditedAt === null) {
    return false;
  }
  if (lastEditedAt < 0) {
    const after = now.minus({ months: -lastEditedAt });
    if (studyRequest.lastEditedAt.valueOf() <= after.valueOf()) {
      return false;
    }
  }
  if (lastEditedAt > 0) {
    const before = now.minus({ months: lastEditedAt });
    if (studyRequest.lastEditedAt.valueOf() > before.valueOf()) {
      return false;
    }
  }
  if (statuses.length > 0 && !statuses.includes(studyRequest.status)) {
    return false;
  }
  const studyTypesFull = [...studyTypes];
  if (studyTypeOther) {
    studyTypesFull.push(
      ...StudyType.enumValues.filter(({ other }) => other),
    );
  }
  if (studyTypesFull.length > 0 && !studyTypesFull.includes(studyRequest.studyType)) {
    return false;
  }
  if (userOnly && studyRequest.userId !== user.id) {
    return false;
  }
  return true;
}

function searchKeyForColumn(column) {
  if (column !== null) {
    return RequestSearchKeys[column];
  }
  return (q, r) => Object.values(RequestSearchKeys).some(
    searchKey => searchKey(q, r),
  );
}

function searchMatchesItem(search, item) {
  const { column, query } = search;
  if (query === null) {
    return true;
  }
  const searchKey = searchKeyForColumn(column);
  return searchKey(query, item);
}

function filterItem(filters, search, user, item) {
  if (item.type === ItemType.STUDY_REQUEST) {
    if (!filtersMatchStudyRequest(filters, user, item.studyRequest)) {
      return null;
    }
    if (!searchMatchesItem(search, item)) {
      return null;
    }
    return item;
  }
  const { studyRequestBulk } = item;
  const studyRequests = studyRequestBulk.studyRequests
    .map(studyRequestItem => filterItem(filters, search, user, studyRequestItem))
    .filter(studyRequestItem => studyRequestItem !== null);
  if (studyRequests.length === 0) {
    return null;
  }
  const studyRequestBulkFiltered = {
    ...studyRequestBulk,
    studyRequests,
  };
  return {
    ...item,
    studyRequestBulk: studyRequestBulkFiltered,
  };
}

const RequestFilters = {
  filterItem,
};

export {
  RequestFilters as default,
  filterItem,
};
