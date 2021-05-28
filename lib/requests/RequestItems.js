import { centrelineKey } from '@/lib/Constants';
import {
  bulkAssignedToStr,
  bulkCreatedAt,
  bulkDueDate,
  bulkStatus,
  bulkUrgent,
  ItemType,
} from '@/lib/requests/RequestStudyBulkUtils';

function getStudyRequestItem(
  studyRequestLocations,
  studyRequestUsers,
  studyRequest,
) {
  const {
    assignedTo,
    centrelineId,
    centrelineType,
    createdAt,
    dueDate,
    id,
    status,
    urgent,
    userId,
  } = studyRequest;

  const feature = { centrelineId, centrelineType };
  const key = centrelineKey(feature);
  let location = null;
  let ariaLabel = `Request #${id}`;
  if (studyRequestLocations.has(key)) {
    location = studyRequestLocations.get(key);
    ariaLabel = `${ariaLabel}: ${location.description}`;
  }

  let requestedBy = null;
  if (studyRequestUsers.has(userId)) {
    requestedBy = studyRequestUsers.get(userId);
  }

  const assignedToStr = assignedTo === null ? 'Unassigned' : assignedTo.text;

  return {
    type: ItemType.STUDY_REQUEST,
    ariaLabel,
    assignedTo: assignedToStr,
    createdAt,
    dueDate,
    id: `STUDY_REQUEST:${id}`,
    location,
    requestedBy,
    status,
    studyRequest,
    urgent,
  };
}

function getStudyRequestBulkItem(
  studyRequestLocations,
  studyRequestUsers,
  studyRequestBulk,
) {
  const {
    id,
    studyRequests,
    userId,
  } = studyRequestBulk;

  const studyRequestsNormalized = studyRequests.map(
    studyRequest => getStudyRequestItem(
      studyRequestLocations,
      studyRequestUsers,
      studyRequest,
    ),
  );

  let requestedBy = null;
  if (studyRequestUsers.has(userId)) {
    requestedBy = studyRequestUsers.get(userId);
  }

  return {
    type: ItemType.STUDY_REQUEST_BULK,
    ariaLabel: `Project: ${studyRequestBulk.name}`,
    assignedTo: bulkAssignedToStr(studyRequests),
    createdAt: bulkCreatedAt(studyRequests),
    dueDate: bulkDueDate(studyRequests),
    id: `STUDY_REQUEST_BULK:${id}`,
    requestedBy,
    status: bulkStatus(studyRequests),
    studyRequestBulk: {
      ...studyRequestBulk,
      studyRequests: studyRequestsNormalized,
    },
    studyRequestsTotal: studyRequests.length,
    urgent: bulkUrgent(studyRequests),
  };
}

const RequestItems = {
  getStudyRequestItem,
  getStudyRequestBulkItem,
};

export {
  RequestItems as default,
  getStudyRequestItem,
  getStudyRequestBulkItem,
};
