// TODO: DRY with server.js
const CentrelineType = {
  SEGMENT: 1,
  INTERSECTION: 2,
};

const COUNT_TYPES = [
  { label: 'Pedestrian Crossover Observation', value: 'PXO_OBSERVE', automatic: false },
  { label: 'Pedestrian Delay and Classification', value: 'PED_DELAY', automatic: false },
  { label: 'Speed / Volume ATR', value: 'ATR_SPEED_VOLUME', automatic: true },
  { label: 'Turning Movement Count', value: 'TMC', automatic: false },
  { label: 'Volume ATR', value: 'ATR_VOLUME', automatic: true },
];

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

// TODO: DRY with server.js
const Format = {
  GEOJSON: 'geojson',
  JSON: 'json',
};

const REASONS = [
  { label: 'Traffic Signal Control', value: 'TSC' },
  { label: 'Pedestrian Crossover (PXO)', value: 'PXO' },
  { label: 'Updated count (3 years expired)', value: 'EXPIRED' },
  { label: 'Pedestrian Safety', value: 'PED_SAFETY' },
  { label: 'Signal Timing', value: 'SIGNAL_TIMING' },
];

const RequestStatus = {
  REQUESTED: 0,
  FLAGGED: 1,
  REVIEWED: 2,
  SUBMITTED: 3,
  SCHEDULED: 4,
  DATA_READY: 5,
};

const REQUEST_STATUS_META = [
  { label: 'Requested' },
  { label: 'Flagged', class: 'error' },
  { label: 'Reviewed', class: 'warning' },
  { label: 'Submitted', class: 'info' },
  { label: 'Scheduled', class: 'info' },
  { label: 'Data Ready', class: 'success' },
];

const SortDirection = {
  ASC: 1,
  DESC: -1,
};

const SortKeys = {
  Counts: {
    DATE: c => (c.date === null ? -Infinity : c.date.valueOf()),
    STATUS: c => c.status,
    STUDY_TYPE: c => c.type.label,
  },
  Requests: {
    DATE: r => r.dueDate.valueOf(),
    ID: r => r.id,
    LOCATION: r => r.location.name,
    PRIORITY: r => (r.priority === 'STANDARD' ? 0 : 1),
    REQUESTER: r => r.requestedBy.name,
    STATUS: r => r.status,
  },
};

const Status = {
  RECENT: 0,
  OLD_3: 1,
  OLD_5: 2,
  NO_EXISTING_COUNT: 3,
  REQUEST_IN_PROGRESS: 4,
};

const STATUS_META = [
  { label: 'Recent', class: 'success', icon: 'check' },
  { label: '3 years+', class: 'warning', icon: 'history' },
  { label: '5 years+', class: 'warning', icon: 'history' },
  { label: 'None existing', class: 'error', icon: 'times' },
  { label: 'In progress', class: 'info', icon: 'user-clock' },
];

// TODO: maybe export these without 'default' so that we can use
// destructuring imports?
export default {
  CentrelineType,
  COUNT_TYPES,
  DAYS_OF_WEEK,
  Format,
  REASONS,
  RequestStatus,
  REQUEST_STATUS_META,
  SortDirection,
  SortKeys,
  Status,
  STATUS_META,
};
