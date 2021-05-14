function cloneStudyRequestAsTransient(studyRequest) {
  const {
    urgent,
    urgentReason,
    dueDate,
    estimatedDeliveryDate,
    reason,
    reasonOther,
    ccEmails,
    studyType,
    studyTypeOther,
    daysOfWeek,
    duration,
    hours,
    notes,
    centrelineId,
    centrelineType,
    geom,
  } = studyRequest;
  return {
    urgent,
    urgentReason,
    dueDate,
    estimatedDeliveryDate,
    reason,
    reasonOther,
    ccEmails: [...ccEmails],
    studyType,
    studyTypeOther,
    daysOfWeek: [...daysOfWeek],
    duration,
    hours,
    notes,
    centrelineId,
    centrelineType,
    geom: JSON.parse(JSON.stringify(geom)),
  };
}

function cloneStudyRequestBulkAsTransient(studyRequestBulk) {
  const {
    ccEmails,
    dueDate,
    estimatedDeliveryDate,
    name,
    reason,
    reasonOther,
    s1,
    selectionType,
    studyRequests,
    urgent,
    urgentReason,
  } = studyRequestBulk;
  const studyRequestsTransient = studyRequests.map(cloneStudyRequestAsTransient);
  return {
    ccEmails: [...ccEmails],
    dueDate,
    estimatedDeliveryDate,
    name,
    reason,
    reasonOther,
    s1,
    selectionType,
    studyRequests: studyRequestsTransient,
    urgent,
    urgentReason,
  };
}

/**
 * @namespace
 */
const RequestClone = {
  cloneStudyRequestAsTransient,
  cloneStudyRequestBulkAsTransient,
};

export {
  RequestClone as default,
  cloneStudyRequestAsTransient,
  cloneStudyRequestBulkAsTransient,
};
