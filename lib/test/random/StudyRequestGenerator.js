import {
  CentrelineType,
  StudyHours,
  StudyType,
} from '@/lib/Constants';
import Random from '@/lib/Random';
import { generateEmail } from '@/lib/test/random/UserGenerator';
import DateTime from '@/lib/time/DateTime';

const NAME_PREFIXES = [
  'Destination',
  'Active',
  'Quiet',
  'Danforth',
  'Eglinton Crosstown',
  'Shaw',
  'Jane and Finch',
  'Crescent Town',
  'Lakeshore',
  'Bloor',
];

const NAME_MODES = [
  'Bike',
  'Pedestrian',
  'Transit',
  'Multi-Modal',
  'Accessible',
  'Calming',
  'Active Transportation',
  'Vehicle Flow',
  'Signal Timing',
  'Lane Reduction',
  'Counterflow',
];

const NAME_SUFFIXES = [
  'Pilot',
  'Area Study',
  'Master Plan',
  'Investigation',
  'Prioritization',
  'Corridor',
  'Design Intervention',
  'Community Consultation',
];

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

const STUDY_TYPES_OTHER_AUTOMATIC = [
  'Automated Speed Enforcement test',
  'Pedestrian counter',
  'Video study',
];

const STUDY_TYPES_OTHER_MANUAL = [
  'Left-turn study',
  'Origin-Destination',
  'Queue and Delay',
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
    };
  }
  const tMin = now.plus({ weeks: 2 }).valueOf();
  const tMax = now.plus({ months: 2 }).valueOf();
  const t = Random.range(tMin, tMax);
  const dueDate = DateTime.fromMillis(t);
  return {
    dueDate,
  };
}

function generateStudyTypeOther(studyType) {
  if (studyType === StudyType.OTHER_AUTOMATIC) {
    return Random.choice(STUDY_TYPES_OTHER_AUTOMATIC);
  }
  if (studyType === StudyType.OTHER_MANUAL) {
    return Random.choice(STUDY_TYPES_OTHER_MANUAL);
  }
  return null;
}

function generateStudyType() {
  const daysOfWeek = [2, 3, 4];
  const studyType = Random.choice(StudyType.enumValues);
  const studyTypeOther = generateStudyTypeOther(studyType);
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
    studyTypeOther,
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
    ...generateStudyType(),
    ...generateUrgent(),
  };
}

function generateStudyRequestBulkName() {
  const prefix = Random.choice(NAME_PREFIXES);
  const mode = Random.choice(NAME_MODES);
  const suffix = Random.choice(NAME_SUFFIXES);
  return `${prefix} ${mode} ${suffix}`;
}

function generateStudyRequestBulk() {
  const n = Random.range(2, 6);
  const studyRequests = new Array(n);
  for (let i = 0; i < n; i++) {
    const urgent = generateUrgent();
    studyRequests[i] = {
      ...generateCentreline(),
      ...generateStudyType(),
      ...urgent,
    };
  }
  return {
    ...generateCcEmails(true),
    name: generateStudyRequestBulkName(),
    notes: Random.choice(REASONS_OTHER),
    studyRequests,
  };
}

/**
 * @namespace
 */
const StudyRequestGenerator = {
  generateStudyRequest,
  generateStudyRequestBulk,
};

export {
  StudyRequestGenerator as default,
  generateStudyRequest,
  generateStudyRequestBulk,
};
