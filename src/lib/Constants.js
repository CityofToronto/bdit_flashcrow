function centrelineKey(centrelineType, centrelineId) {
  return `${centrelineType}/${centrelineId}`;
}

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
  { label: 'RESCU (Highway / Ramp)', value: 'RESCU', automatic: true },
  { label: 'Speed / Volume ATR', value: 'ATR_SPEED_VOLUME', automatic: true },
  { label: 'Turning Movement Count', value: 'TMC', automatic: false },
  { label: 'Volume ATR', value: 'ATR_VOLUME', automatic: true },
];

const FeatureCode = {
  EXPRESSWAY: 201100,
  EXPRESSWAY_RAMP: 201101,
  MAJOR_ARTERIAL: 201200,
};

const HttpStatus = {
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  isOk(statusCode) {
    return statusCode >= 200 && statusCode <= 299;
  },
};

const ReportFormat = {
  CSV: 'csv',
  JSON: 'json',
  PDF: 'pdf',
};

const ReportType = {
  COUNT_SUMMARY_24H: 'CountSummary24h',
  COUNT_SUMMARY_24H_DETAILED: 'CountSummary24hDetailed',
  COUNT_SUMMARY_24H_GRAPHICAL: 'CountSummary24hGraphical',
  COUNT_SUMMARY_TURNING_MOVEMENT: 'CountSummaryTurningMovement',
  COUNT_SUMMARY_TURNING_MOVEMENT_ILLUSTRATED: 'CountSummaryTurningMovementIllustrated',
  INTERSECTION_WARRANT_SUMMARY: 'IntersectionWarrantSummary',
  SPEED_PERCENTILE: 'SpeedPercentile',
};

const RequestStatus = {
  REQUESTED: {
    icon: 'concierge-bell',
    variant: 'info',
  },
  FLAGGED: {
    icon: 'flag',
    variant: 'warning',
  },
  REVIEWED: {
    icon: 'check-square',
    variant: 'info',
  },
  SUBMITTED: {
    icon: 'hourglass-start',
    variant: 'info',
  },
  SCHEDULED: {
    icon: 'calendar-check',
    variant: 'info',
  },
  DATA_READY: {
    icon: 'file-archive',
    variant: 'warning',
  },
  COMPLETED: {
    icon: 'check',
    variant: 'success',
  },
  CANCELLED: {
    icon: 'times-circle',
    variant: 'error',
  },
};

const SignalType = {
  NORMAL: 1,
  PEDCROSS: 2,
};

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
  Studies: {
    CREATED_AT: s => s.createdAt.valueOf(),
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
  centrelineKey,
  CentrelineType,
  CountHours,
  COUNT_TYPES,
  FeatureCode,
  HttpStatus,
  ReportFormat,
  ReportType,
  RequestStatus,
  SignalType,
  SortDirection,
  SortKeys,
  SPEED_CLASSES,
  Status,
  STATUS_META,
};
export {
  Constants as default,
  centrelineKey,
  CentrelineType,
  CountHours,
  COUNT_TYPES,
  FeatureCode,
  HttpStatus,
  ReportFormat,
  ReportType,
  RequestStatus,
  SignalType,
  SortDirection,
  SortKeys,
  SPEED_CLASSES,
  Status,
  STATUS_META,
};
