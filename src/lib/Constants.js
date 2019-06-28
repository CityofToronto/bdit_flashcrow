// TODO: DRY with server.js
const CentrelineType = {
  SEGMENT: 1,
  INTERSECTION: 2,
};

const CountHours = {
  ROUTINE: [
    ['07:30', '09:30'],
    ['10:00', '12:00'],
    ['13:00', '15:00'],
    ['16:00', '18:00'],
  ],
  SCHOOL: [
    ['07:30', '09:30'],
    ['10:00', '11:00'],
    ['12:00', '13:30'],
    ['14:15', '15:45'],
    ['16:00', '18:00'],
  ],
};

const COUNT_TYPES = [
  { label: 'Bicycle Volume ATR', value: 'ATR_VOLUME_BICYCLE', automatic: true },
  { label: 'Ped Crossover Observation', value: 'PXO_OBSERVE', automatic: false },
  { label: 'Ped Delay and Classification', value: 'PED_DELAY', automatic: false },
  { label: 'RESCU', value: 'RESCU', automatic: true },
  { label: 'Speed / Volume ATR', value: 'ATR_SPEED_VOLUME', automatic: true },
  { label: 'Turning Movement Count', value: 'TMC', automatic: false },
  { label: 'Volume ATR', value: 'ATR_VOLUME', automatic: true },
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
    DAY: c => (c.date === null ? -Infinity : c.date.getDay()),
    STATUS: c => c.status,
    STUDY_TYPE: c => c.type.label,
  },
  Requests: {
    DATE: r => r.dueDate.valueOf(),
    ID: r => r.id,
    LOCATION: r => r.location.description,
    PRIORITY: r => (r.priority === 'STANDARD' ? 0 : 1),
    REQUESTER: r => r.requestedBy.name,
    STATUS: r => r.status,
  },
};


// TODO: put this in a database somewhere!
/*
 * These are *half-open intervals*, i.e. `[min, max)` covers all speeds
 * `min <= speed && speed < max`.
 */
const SPEED_CLASSES = [
  [0, 19],
  [19, 25],
  [25, 30],
  [30, 35],
  [35, 40],
  [40, 45],
  [45, 50],
  [50, 55],
  [55, 60],
  [60, 65],
  [65, 70],
  [70, 75],
  [75, 80],
  [80, 160],
];

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

const Constants = {
  CentrelineType,
  CountHours,
  COUNT_TYPES,
  Format,
  REASONS,
  RequestStatus,
  REQUEST_STATUS_META,
  SortDirection,
  SortKeys,
  SPEED_CLASSES,
  Status,
  STATUS_META,
};
export {
  Constants as default,
  CentrelineType,
  CountHours,
  COUNT_TYPES,
  Format,
  REASONS,
  RequestStatus,
  REQUEST_STATUS_META,
  SortDirection,
  SortKeys,
  SPEED_CLASSES,
  Status,
  STATUS_META,
};
