import { Enum } from '@/lib/ClassUtils';
import { centrelineKey, StudyRequestStatus } from '@/lib/Constants';
import DateTime from '@/lib/time/DateTime';

function bulkAssignedToStr(studyRequests) {
  const assignedTos = new Set(
    studyRequests.map(({ assignedTo }) => assignedTo),
  );
  return Array.from(assignedTos)
    .map(assignedTo => (assignedTo === null ? 'Unassigned' : assignedTo.text))
    .join(', ');
}

function bulkCreatedAt(studyRequests) {
  return DateTime.min(
    ...studyRequests.map(({ createdAt }) => createdAt),
  );
}

function bulkDueDate(studyRequests) {
  return DateTime.min(
    ...studyRequests.map(({ dueDate }) => dueDate),
  );
}

function bulkIndicesDeselected(locations, studyRequests) {
  const keys = new Set(studyRequests.map(centrelineKey));
  const indicesDeselected = [];
  locations.forEach((location, i) => {
    const key = centrelineKey(location);
    if (!keys.has(key)) {
      indicesDeselected.push(i);
    }
  });
  return indicesDeselected;
}

function bulkStatus(studyRequests) {
  if (studyRequests.length === 0) {
    return null;
  }
  const statuses = new Set(studyRequests.map(({ status }) => status));
  if (statuses.has(StudyRequestStatus.REQUESTED)) {
    return StudyRequestStatus.REQUESTED;
  }
  if (statuses.has(StudyRequestStatus.CHANGES_NEEDED)) {
    return StudyRequestStatus.CHANGES_NEEDED;
  }
  if (statuses.has(StudyRequestStatus.ASSIGNED)) {
    return StudyRequestStatus.ASSIGNED;
  }
  if (statuses.has(StudyRequestStatus.REJECTED)) {
    return StudyRequestStatus.REJECTED;
  }
  if (statuses.has(StudyRequestStatus.COMPLETED)) {
    return StudyRequestStatus.COMPLETED;
  }
  return StudyRequestStatus.CANCELLED;
}

function bulkUrgent(studyRequests) {
  return studyRequests.some(({ urgent }) => urgent);
}

class ItemType extends Enum {}
ItemType.init(['STUDY_REQUEST', 'STUDY_REQUEST_BULK']);

const RequestStudyBulkUtils = {
  bulkAssignedToStr,
  bulkCreatedAt,
  bulkDueDate,
  bulkIndicesDeselected,
  bulkStatus,
  bulkUrgent,
  ItemType,
};

export {
  RequestStudyBulkUtils as default,
  bulkAssignedToStr,
  bulkCreatedAt,
  bulkDueDate,
  bulkIndicesDeselected,
  bulkStatus,
  bulkUrgent,
  ItemType,
};
