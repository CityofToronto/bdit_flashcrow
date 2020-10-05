import { Enum } from '@/lib/ClassUtils';
import { centrelineKey, StudyRequestStatus } from '@/lib/Constants';

function bulkAssignedToStr(studyRequests) {
  const assignedTos = new Set(
    studyRequests.map(({ assignedTo }) => assignedTo),
  );
  return Array.from(assignedTos)
    .map(assignedTo => (assignedTo === null ? 'Unassigned' : assignedTo.text))
    .join(', ');
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
  if (statuses.has(StudyRequestStatus.COMPLETED)) {
    return StudyRequestStatus.COMPLETED;
  }
  if (statuses.has(StudyRequestStatus.REJECTED)) {
    return StudyRequestStatus.REJECTED;
  }
  return StudyRequestStatus.CANCELLED;
}

class ItemType extends Enum {}
ItemType.init(['STUDY_REQUEST', 'STUDY_REQUEST_BULK']);

const RequestStudyBulkUtils = {
  bulkAssignedToStr,
  bulkIndicesDeselected,
  bulkStatus,
  ItemType,
};

export {
  RequestStudyBulkUtils as default,
  bulkAssignedToStr,
  bulkIndicesDeselected,
  bulkStatus,
  ItemType,
};
