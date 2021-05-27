import {
  CentrelineType,
  StudyHours,
  StudyType,
} from '@/lib/Constants';

function getDueDate(now) {
  if (now === null) {
    return null;
  }
  return now.plus({ months: 3 });
}

function getLocationDetails(location) {
  if (location === null) {
    return {
      centrelineId: null,
      centrelineType: null,
      lng: null,
      lat: null,
    };
  }
  return location;
}

function makeStudyRequest(now = null, location = null) {
  const dueDate = getDueDate(now);
  const {
    centrelineId,
    centrelineType,
    lng,
    lat,
  } = getLocationDetails(location);
  const geom = {
    type: 'Point',
    coordinates: [lng, lat],
  };
  let duration = null;
  let hours = null;
  let studyType = null;
  if (centrelineType === CentrelineType.INTERSECTION) {
    hours = StudyHours.ROUTINE;
    studyType = StudyType.TMC;
  } else {
    duration = 72;
  }
  return {
    urgent: false,
    urgentReason: null,
    dueDate,
    reason: null,
    reasonOther: null,
    ccEmails: [],
    studyType,
    studyTypeOther: null,
    daysOfWeek: [2, 3, 4],
    duration,
    hours,
    notes: '',
    centrelineId,
    centrelineType,
    geom,
  };
}

function makeStudyRequestBulk(now = null, locations = []) {
  const studyRequests = locations.map(
    location => makeStudyRequest(now, location),
  );
  return {
    ccEmails: [],
    name: null,
    notes: null,
    studyRequests,
  };
}

/**
 * @namespace
 */
const RequestEmpty = {
  makeStudyRequest,
  makeStudyRequestBulk,
};

export {
  RequestEmpty as default,
  makeStudyRequest,
  makeStudyRequestBulk,
};
