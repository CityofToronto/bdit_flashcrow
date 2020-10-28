import {
  CentrelineType,
  StudyHours,
  StudyRequestReason,
  StudyType,
} from '@/lib/Constants';
import Random from '@/lib/Random';
import { generateEmail } from '@/lib/test/random/UserGenerator';
import DateTime from '@/lib/time/DateTime';

const NOTES = [
  '',
  '',
  'completely normal count',
];

const NOTES_OTHER_HOURS = [
  'shopping mall peak hours: 11:30-13:30, 18:00-22:00',
  '7-11am, 12-2pm, 5-8pm',
];

const REASONS_OTHER = [
  'councillor requesting new count',
  'residents requesting new count',
  'street-level accessibility',
  'nearby long-term construction',
  'upcoming development in area',
  'new bike pilot installed',
  'previous data considered unreliable',
  'ongoing validation of historical data',
  'inform larger area planning',
  'inform transit re-routing',
  'measure ActiveTO utilization by mode',
  'Quiet Street analysis',
  'Eglinton crosstown project',
  'fill identified gap in traffic volume model',
  'investigate senior safety',
  'investigate motorcyclist safety',
  'crossing guard placement for school safety zone',
  'inform placement of Automated Speed Enforcement cameras',
  'investigating optimal route to connect bike corridors',
];

const URGENT_REASONS = [
  'high-priority councillor request',
  'recent KSI at location',
  'frequent collisions at location',
  'must be completed seasonally',
  'upcoming project deadline',
  'required for committee report',
  'must be completed before end of school year',
  'must be completed before winter holidays',
];

function generateCcEmails(urgent) {
  let ns = [0, 0, 0, 0, 1, 1, 2, 3];
  if (urgent) {
    ns = ns.filter(n => n > 0);
  }
  const n = Random.choice(ns);
  const ccEmails = new Array(n);
  for (let i = 0; i < n; i++) {
    ccEmails[i] = generateEmail();
  }
  return { ccEmails };
}

function generateCentreline() {
  const centrelineId = Random.range(100, 30000000);
  const centrelineType = Random.choice([CentrelineType.INTERSECTION, CentrelineType.SEGMENT]);
  let lng = Random.uniform(-79.639264937, -79.115243191);
  let lat = Random.uniform(43.580995995, 43.855457183);
  // quantize (lng, lat) coordinates to floating-point values with exact representations
  lng = Math.round(lng * 32) / 32;
  lat = Math.round(lat * 32) / 32;
  const geom = {
    type: 'Point',
    coordinates: [lng, lat],
  };
  return { centrelineId, centrelineType, geom };
}

function generateDueDate(urgent) {
  const now = DateTime.local();
  if (!urgent) {
    return {
      dueDate: now.plus({ months: 3 }),
      estimatedDeliveryDate: now.plus({ months: 2, weeks: 3 }),
    };
  }
  const tMin = now.plus({ weeks: 2 }).valueOf();
  const tMax = now.plus({ months: 2 }).valueOf();
  const t = Random.range(tMin, tMax);
  const dueDate = DateTime.fromMillis(t);
  return {
    dueDate,
    estimatedDeliveryDate: dueDate,
  };
}

function generateReason() {
  const reason = Random.choice(StudyRequestReason.enumValues);
  const reasonOther = reason === StudyRequestReason.OTHER ? Random.choice(REASONS_OTHER) : null;
  return { reason, reasonOther };
}

function generateStudyType() {
  const daysOfWeek = [2, 3, 4];
  const studyType = Random.choice(StudyType.enumValues);
  const duration = studyType.automatic ? 72 : null;
  const hours = studyType.automatic ? null : Random.choice(StudyHours.enumValues);
  const notes = hours === StudyHours.OTHER
    ? Random.choice(NOTES_OTHER_HOURS)
    : Random.choice(NOTES);
  return {
    daysOfWeek,
    duration,
    hours,
    notes,
    studyType,
  };
}

function generateUrgent() {
  const urgent = Random.choice([true, false]);
  const urgentReason = urgent ? Random.choice(URGENT_REASONS) : null;
  return {
    ...generateCcEmails(urgent),
    ...generateDueDate(urgent),
    urgent,
    urgentReason,
  };
}

function generateStudyRequest() {
  return {
    ...generateCentreline(),
    ...generateReason(),
    ...generateStudyType(),
    ...generateUrgent(),
  };
}

/**
 * @namespace
 */
const StudyRequestGenerator = {
  generateStudyRequest,
};

export {
  StudyRequestGenerator as default,
  generateStudyRequest,
};