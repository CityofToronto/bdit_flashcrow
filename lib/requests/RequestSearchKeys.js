import { formatUsername } from '@/lib/StringFormatters';

const RequestSearchKeys = {
  ID: (q, r) => {
    const qNum = parseInt(q, 10);
    if (Number.isNaN(qNum)) {
      return q === '';
    }
    return qNum === r.studyRequest.id;
  },
  ASSIGNED_TO: (q, r) => {
    const qLower = q.toLowerCase();
    let rLower = 'unassigned';
    if (r.studyRequest.assignedTo) {
      rLower = r.studyRequest.assignedTo.text.toLowerCase();
    }
    return rLower.indexOf(qLower) !== -1;
  },
  LOCATION: (q, r) => {
    if (!r.location || !r.location.description) {
      return q === '';
    }
    const qLower = q.toLowerCase();
    const rLower = r.location.description.toLowerCase();
    return rLower.indexOf(qLower) !== -1;
  },
  REQUESTER: (q, r) => {
    if (r.requestedBy === null) {
      return q === '';
    }
    const qLower = q.toLowerCase();
    const rLower = formatUsername(r.requestedBy).toLowerCase();
    return rLower.indexOf(qLower) !== -1;
  },
  STATUS: (q, r) => {
    const qLower = q.toLowerCase();
    const rLower = r.studyRequest.status.text.toLowerCase();
    return rLower.indexOf(qLower) !== -1;
  },
  STUDY_TYPE: (q, r) => {
    const qLower = q.toLowerCase();
    let rLower = r.studyRequest.studyType.label.toLowerCase();
    if (rLower.indexOf(qLower) !== -1) {
      return true;
    }
    rLower = r.studyRequest.studyType.name.toLowerCase();
    return rLower.indexOf(qLower) !== -1;
  },
};

export default RequestSearchKeys;
