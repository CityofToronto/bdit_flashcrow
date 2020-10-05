import { centrelineKey } from '@/lib/Constants';
import { bulkAssignedToStr, bulkStatus, ItemType } from '@/lib/requests/RequestStudyBulkUtils';

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
    lastEditedAt,
    status,
    urgent,
    userId,
  } = studyRequest;

  const feature = { centrelineId, centrelineType };
  const key = centrelineKey(feature);
  let location = null;
  if (studyRequestLocations.has(key)) {
    location = studyRequestLocations.get(key);
  }

  let requestedBy = null;
  if (studyRequestUsers.has(userId)) {
    requestedBy = studyRequestUsers.get(userId);
  }

  const assignedToStr = assignedTo === null ? 'Unassigned' : assignedTo.text;

  return {
    type: ItemType.STUDY_REQUEST,
    ariaLabel: `View Request #${id}`,
    assignedTo: assignedToStr,
    createdAt,
    dueDate,
    id: `STUDY_REQUEST:${id}`,
    lastEditedAt,
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
    createdAt,
    dueDate,
    lastEditedAt,
    studyRequests,
    urgent,
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
    ariaLabel: `View Bulk Request: ${studyRequestBulk.name}`,
    assignedTo: bulkAssignedToStr(studyRequests),
    createdAt,
    dueDate,
    id: `STUDY_REQUEST_BULK:${id}`,
    lastEditedAt,
    requestedBy,
    status: bulkStatus(studyRequests),
    studyRequestBulk: {
      ...studyRequestBulk,
      studyRequests: studyRequestsNormalized,
    },
    studyRequestsTotal: studyRequests.length,
    urgent,
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
