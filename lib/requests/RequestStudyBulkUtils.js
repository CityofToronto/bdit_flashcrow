import { Enum } from '@/lib/ClassUtils';
import { StudyRequestStatus } from '@/lib/Constants';

function bulkAssignedToStr(studyRequests) {
  const assignedTos = new Set(
    studyRequests
      .filter(({ assignedTo }) => assignedTo !== null)
      .map(({ assignedTo }) => assignedTo),
  );
  if (assignedTos.size === 0) {
    return 'None';
  }
  return Array.from(assignedTos)
    .map(({ text }) => text)
    .join(', ');
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
  bulkStatus,
  ItemType,
};

export {
  RequestStudyBulkUtils as default,
  bulkAssignedToStr,
  bulkStatus,
  ItemType,
};
