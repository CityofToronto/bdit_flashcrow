import RequestSearchKeys from '@/lib/requests/RequestSearchKeys';
import { ItemType } from '@/lib/requests/RequestStudyBulkUtils';
import DateTime from '@/lib/time/DateTime';

function timeAgoFilterText(prefix, value) {
  const monthPlural = Math.abs(value) === 1 ? 'month' : 'months';
  if (value < 0) {
    return `${prefix} \u003c ${-value} ${monthPlural} ago`;
  }
  return `${prefix} \u2265 ${value} ${monthPlural} ago`;
}

function statusFilterText(items, status) {
  const { text } = status;
  let n = 0;
  items.forEach((item) => {
    if (item.status === status) {
      n += 1;
    }
  });
  return `${text} (${n})`;
}

function getFilterChips(filters, items) {
  const {
    assignees,
    closed,
    createdAt,
    lastEditedAt,
    statuses,
    studyTypes,
    userOnly,
  } = filters;
  const filterChips = [];
  studyTypes.forEach((studyType) => {
    const { label: text } = studyType;
    const filterChip = { filter: 'studyTypes', text, value: studyType };
    filterChips.push(filterChip);
  });
  statuses.forEach((status) => {
    const text = statusFilterText(items, status);
    const filterChip = { filter: 'statuses', text, value: status };
    filterChips.push(filterChip);
  });
  if (closed) {
    const filterChip = { filter: 'closed', text: 'Closed', value: true };
    filterChips.push(filterChip);
  }
  assignees.forEach((assignee) => {
    const text = assignee === null ? 'None' : assignee.text;
    const filterChip = { filter: 'assignees', text, value: assignee };
    filterChips.push(filterChip);
  });
  if (createdAt !== 0) {
    const text = timeAgoFilterText('Created', createdAt);
    const filterChip = { filter: 'createdAt', text, value: createdAt };
    filterChips.push(filterChip);
  }
  if (lastEditedAt !== 0) {
    const text = timeAgoFilterText('Updated', lastEditedAt);
    const filterChip = { filter: 'lastEditedAt', text, value: lastEditedAt };
    filterChips.push(filterChip);
  }
  if (userOnly) {
    const filterChip = { filter: 'userOnly', text: 'User', value: true };
    filterChips.push(filterChip);
  }
  return filterChips;
}

function filtersMatchStudyRequest(filters, user, studyRequest) {
  const {
    assignees,
    closed,
    createdAt,
    lastEditedAt,
    statuses,
    studyTypes,
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
  if (studyTypes.length > 0 && !studyTypes.includes(studyRequest.studyType)) {
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
  getFilterChips,
};

export {
  RequestFilters as default,
  filterItem,
  getFilterChips,
};
