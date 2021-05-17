function cloneStudyRequestAsTransient(studyRequest) {
  const {
    urgent,
    urgentReason,
    dueDate,
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
    name,
    notes,
    studyRequests,
  } = studyRequestBulk;
  const studyRequestsTransient = studyRequests.map(cloneStudyRequestAsTransient);
  return {
    ccEmails: [...ccEmails],
    name,
    notes,
    studyRequests: studyRequestsTransient,
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
