import { Enum } from '@/lib/ClassUtils';

/**
 * Four cardinal directions.  Our legacy FLOW system stores Turning Movement Count
 * data according to these directions.  Additionally, since Toronto's streets operate
 * on a grid system, it is often useful to know cardinal directions of travel.
 *
 * @see GeometryUtils
 * @param {string} short - short abbreviation for cardinal direction
 * @param {number} bearing - compass bearing (in degrees)
 * @param {CardinalDirection} opposing - opposing direction, sometimes used in reports
 */
class CardinalDirection extends Enum {}
CardinalDirection.init({
  NORTH: {
    short: 'N',
    bearing: 0,
    get opposing() {
      return CardinalDirection.SOUTH;
    },
  },
  EAST: {
    short: 'E',
    bearing: 90,
    get opposing() {
      return CardinalDirection.WEST;
    },
  },
  SOUTH: {
    short: 'S',
    bearing: 180,
    get opposing() {
      return CardinalDirection.NORTH;
    },
  },
  WEST: {
    short: 'W',
    bearing: 270,
    get opposing() {
      return CardinalDirection.EAST;
    },
  },
});

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
  MINOR_ARTERIAL: 201300,
};

const HttpStatus = {
  BAD_REQUEST: 400,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  isOk(statusCode) {
    return statusCode >= 200 && statusCode <= 299;
  },
};

/**
 * Report formats available from MOVE Reporter.
 *
 * @param {string} extension - file extension for type
 * @param {string} mimeType - MIME type to return results under
 */
class ReportFormat extends Enum {}
ReportFormat.init({
  CSV: {
    extension: 'csv',
    mimeType: 'text/csv',
  },
  JSON: {
    extension: 'json',
    mimeType: 'application/json',
  },
  PDF: {
    extension: 'pdf',
    mimeType: 'application/pdf',
  },
});

/**
 * Report parameter types available for use in `ReportType#options`.
 *
 * @param {Function} defaultValue - returns the default value used for parameters of this type
 */
class ReportParameter extends Enum {}
ReportParameter.init({
  BOOLEAN: {
    defaultValue() {
      return true;
    },
  },
  DATE_YEAR: {
    defaultValue({ state }) {
      return state.now.getFullYear() - 3;
    },
  },
  INTEGER_NON_NEGATIVE: {
    defaultValue() {
      return 0;
    },
  },
  PREVENTABLE_COLLISIONS: {
    defaultValue() {
      return [0, 0, 0];
    },
  },
  USERNAME: {
    defaultValue({ getters }) {
      return getters.username;
    },
  },
});

/**
 * Report types available from MOVE Reporter.
 *
 * @param {boolean} disabled - this report type is disabled if it hasn't been
 * implemented in MOVE Reporter yet
 * @param {Array<ReportFormat>} - formats supported for this report type
 * @param {string} label - human-readable name of this report type
 * @param {boolean} tmcRelated - does this report type require TMC data?
 * @param {boolean} speedRelated - does this report type require speed data?
 * @param {string} suffix - suffix used for component names
 */
class ReportType extends Enum {}
ReportType.init({
  COUNT_SUMMARY_24H: {
    disabled: true,
    formats: [],
    label: '24-Hour Summary Report',
    tmcRelated: false,
    speedRelated: false,
    suffix: 'CountSummary24h',
  },
  COUNT_SUMMARY_24H_DETAILED: {
    disabled: false,
    formats: [ReportFormat.CSV],
    label: '24-Hour Detailed Report',
    tmcRelated: false,
    speedRelated: false,
    suffix: 'CountSummary24hDetailed',
  },
  COUNT_SUMMARY_24H_GRAPHICAL: {
    disabled: false,
    formats: [ReportFormat.CSV, ReportFormat.PDF],
    label: '24-Hour Graphical Report',
    tmcRelated: false,
    speedRelated: false,
    suffix: 'CountSummary24hGraphical',
  },
  COUNT_SUMMARY_TURNING_MOVEMENT: {
    disabled: false,
    formats: [ReportFormat.CSV],
    label: 'TMC Summary Report',
    tmcRelated: true,
    speedRelated: false,
    suffix: 'CountSummaryTurningMovement',
  },
  COUNT_SUMMARY_TURNING_MOVEMENT_DETAILED: {
    disabled: false,
    formats: [ReportFormat.CSV],
    label: 'TMC Detailed Report',
    tmcRelated: true,
    speedRelated: false,
    suffix: 'CountSummaryTurningMovementDetailed',
  },
  COUNT_SUMMARY_TURNING_MOVEMENT_ILLUSTRATED: {
    disabled: true,
    formats: [],
    label: 'TMC Illustrated Report',
    tmcRelated: true,
    speedRelated: false,
    suffix: 'CountSummaryTurningMovementIllustrated',
  },
  CROSSWALK_OBSERVANCE_SUMMARY: {
    disabled: true,
    formats: [ReportFormat.CSV],
    label: 'Crosswalk Observation Report',
    tmcRelated: false,
    speedRelated: false,
    suffix: 'CrosswalkObservanceSummary',
  },
  INTERSECTION_SUMMARY: {
    disabled: false,
    formats: [ReportFormat.CSV],
    label: 'Intersection Summary Report',
    tmcRelated: true,
    speedRelated: false,
    suffix: 'IntersectionSummary',
  },
  PED_DELAY_SUMMARY: {
    disabled: true,
    formats: [],
    label: 'Ped Delay Summary',
    tmcRelated: false,
    speedRelated: false,
    suffix: 'PedDelaySummary',
  },
  SPEED_PERCENTILE: {
    disabled: false,
    formats: [ReportFormat.CSV],
    label: 'Speed Percentile Report',
    tmcRelated: false,
    speedRelated: true,
    suffix: 'SpeedPercentile',
  },
  WARRANT_TRAFFIC_SIGNAL_CONTROL: {
    disabled: false,
    formats: [],
    label: 'Warrant: Traffic Signal Control',
    options: {
      adequateTrial: ReportParameter.BOOLEAN,
      collisionsTotal: ReportParameter.INTEGER_NON_NEGATIVE,
      preparedBy: ReportParameter.USERNAME,
      preventablesByYear: ReportParameter.PREVENTABLE_COLLISIONS,
      startYear: ReportParameter.DATE_YEAR,
    },
    tmcRelated: true,
    speedRelated: false,
    suffix: 'WarrantTrafficSignalControl',
  },
});

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

const TMC_MODES_NON_VEHICLE = ['PEDS', 'BIKE', 'OTHER'];

const TMC_MODES_VEHICLE = ['CARS', 'TRUCK', 'BUS'];

/**
 * Three turning movements for intersection TMCs, representing the different turns
 * a vehicle can make after entering the intersection.
 *
 * @param {string} header - used in tables / reports as a column header
 * @param {string} short - used as part of the data field name, and when an
 * abbreviated one-letter version is needed
 */
class TurningMovement extends Enum {}
TurningMovement.init({
  RIGHT: {
    header: 'Right',
    short: 'R',
  },
  THRU: {
    header: 'Thru',
    short: 'T',
  },
  LEFT: {
    header: 'Left',
    short: 'L',
  },
});

const TZ_TORONTO = 'America/Toronto';

const Constants = {
  CardinalDirection,
  centrelineKey,
  CentrelineType,
  CountHours,
  COUNT_TYPES,
  FeatureCode,
  HttpStatus,
  ReportFormat,
  ReportParameter,
  ReportType,
  RequestStatus,
  SignalType,
  SortDirection,
  SortKeys,
  SPEED_CLASSES,
  Status,
  STATUS_META,
  TMC_MODES_NON_VEHICLE,
  TMC_MODES_VEHICLE,
  TurningMovement,
  TZ_TORONTO,
};
export {
  Constants as default,
  CardinalDirection,
  centrelineKey,
  CentrelineType,
  CountHours,
  COUNT_TYPES,
  FeatureCode,
  HttpStatus,
  ReportFormat,
  ReportParameter,
  ReportType,
  RequestStatus,
  SignalType,
  SortDirection,
  SortKeys,
  SPEED_CLASSES,
  Status,
  STATUS_META,
  TMC_MODES_NON_VEHICLE,
  TMC_MODES_VEHICLE,
  TurningMovement,
  TZ_TORONTO,
};
