import { Enum } from '@/lib/ClassUtils';
import { StudyRequestStatus } from '@/lib/Constants';
import DateTime from '@/lib/time/DateTime';

const STR_UNASSIGNED = 'Unassigned';

/**
 *
 * @param {Array<Object>} studyRequests
 * @returns {string} string representing assignees of `studyRequests`
 */
function bulkAssignedToStr(studyRequests) {
  if (studyRequests.length === 0) {
    return STR_UNASSIGNED;
  }
  const assignedTos = new Set(
    studyRequests.map(({ assignedTo }) => assignedTo),
  );
  return Array.from(assignedTos)
    .map(assignedTo => (assignedTo === null ? STR_UNASSIGNED : assignedTo.text))
    .join(', ');
}

/**
 *
 * @param {Array<Object>} studyRequests
 * @returns {DateTime?} earliest creation date of any request in `studyRequests`
 */
function bulkCreatedAt(studyRequests) {
  if (studyRequests.length === 0) {
    return null;
  }
  return DateTime.min(
    ...studyRequests.map(({ createdAt }) => createdAt),
  );
}

/**
 *
 * @param {Array<Object>} studyRequests
 * @returns {DateTime?} earliest due date of any request in `studyRequests`
 */
function bulkDueDate(studyRequests) {
  if (studyRequests.length === 0) {
    return null;
  }
  return DateTime.min(
    ...studyRequests.map(({ dueDate }) => dueDate),
  );
}

/**
 *
 * @param {Array<Object>} studyRequests
 * @returns {StudyRequestStatus?} overall status of `studyRequests`
 */
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

/**
 * Used to identify requests vs. projects in study request management tables.
 */
class ItemType extends Enum {}
ItemType.init(['STUDY_REQUEST', 'STUDY_REQUEST_BULK']);

const RequestStudyBulkUtils = {
  bulkAssignedToStr,
  bulkCreatedAt,
  bulkDueDate,
  bulkStatus,
  bulkUrgent,
  ItemType,
};

export {
  RequestStudyBulkUtils as default,
  bulkAssignedToStr,
  bulkCreatedAt,
  bulkDueDate,
  bulkStatus,
  bulkUrgent,
  ItemType,
};
