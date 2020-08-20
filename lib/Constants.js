import { Enum } from '@/lib/ClassUtils';
import TimeFormatters from '@/lib/time/TimeFormatters';

/**
 * Authentication scopes.  Used to restrict access to certain REST API endpoints,
 * frontend routes, and features.
 *
 * @param {string} description - human-readable description of the permissions granted
 * under this scope
 */
class AuthScope extends Enum {}
AuthScope.init({
  ADMIN: {
    description: 'Admin MOVE',
  },
  STUDY_REQUESTS: {
    description: 'View Study Requests',
  },
  STUDY_REQUESTS_ADMIN: {
    description: 'Admin Study Requests',
  },
  STUDY_REQUESTS_EDIT: {
    description: 'Create and Edit Study Requests',
  },
});

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
    bound: 'Northbound',
    get opposing() {
      return CardinalDirection.SOUTH;
    },
  },
  EAST: {
    short: 'E',
    bearing: 90,
    bound: 'Eastbound',
    get opposing() {
      return CardinalDirection.WEST;
    },
  },
  SOUTH: {
    short: 'S',
    bearing: 180,
    bound: 'Southbound',
    get opposing() {
      return CardinalDirection.NORTH;
    },
  },
  WEST: {
    short: 'W',
    bearing: 270,
    bound: 'Westbound',
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

/**
 * Vision Zero emphasis areas for collisions.
 *
 * @see https://www.toronto.ca/services-payments/streets-parking-transportation/road-safety/vision-zero/emphasis-areas/
 */
class CollisionEmphasisArea extends Enum {}
// TODO: add filtering functions
CollisionEmphasisArea.init({
  PROPERTY_DAMAGE: {
    field: 'property_damage',
    text: 'Property Damage',
  },
  AGGRESSIVE_DRIVING: {
    field: 'aggressive',
    text: 'Aggressive Driving',
  },
  CYCLISTS: {
    field: 'cyclist',
    text: 'Cyclists',
  },
  PEDESTRIANS: {
    field: 'pedestrian',
    text: 'Pedestrians',
  },
  MOTORCYCLISTS: {
    field: 'motorcyclist',
    text: 'Motorcyclists',
  },
  OLDER_ADULTS: {
    field: 'older_adult',
    text: 'Older Adults',
  },
  SCHOOL_CHILDREN: {
    field: 'school_child',
    text: 'School Children',
  },
});

class CollisionRoadSurfaceCondition extends Enum {}
CollisionRoadSurfaceCondition.init({
  CLEAR: {
    code: 1,
    text: 'Clear',
  },
  RAIN: {
    code: 2,
    text: 'Rain',
  },
  SNOW: {
    code: 3,
    text: 'Snow',
  },
  FREEZING_RAIN: {
    code: 4,
    text: 'Freezing Rain',
  },
  DRIFTING_SNOW: {
    code: 5,
    text: 'Drifting Snow',
  },
  STRONG_WIND: {
    code: 6,
    text: 'Strong Wind',
  },
  VISIBILITY_LIMITED: {
    code: 7,
    text: 'Fog, Mist, Smoke, Dust',
  },
});

const FeatureCode = {
  EXPRESSWAY: 201100,
  EXPRESSWAY_RAMP: 201101,
  MAJOR_ARTERIAL: 201200,
  MINOR_ARTERIAL: 201300,
};

/**
 * Common HTTP status codes.  Used when you need to compare a status code, or to call
 * `Boom.boomify` on an `Error`.
 *
 * @param {number} statusCode - HTTP status code.
 */
class HttpStatus extends Enum {
  isOk() {
    return this.statusCode >= 200 && this.statusCode <= 299;
  }
}
HttpStatus.init({
  OK: {
    statusCode: 200,
  },
  BAD_REQUEST: {
    statusCode: 400,
  },
  FORBIDDEN: {
    statusCode: 403,
  },
  NOT_FOUND: {
    statusCode: 404,
  },
});

class LocationMode extends Enum {}
LocationMode.init({
  SINGLE: {
    multi: false,
  },
  MULTI_EDIT: {
    multi: true,
  },
  MULTI: {
    multi: true,
  },
});

/**
 * Location search types, corresponding to different types of entities to search over in
 * {@link LocationController.getLocationSuggestions}.
 */
class LocationSearchType extends Enum {}
LocationSearchType.init([
  'ARTERY',
  'INTERSECTION',
  'SIGNAL',
]);

/**
 * Location selection types, used to distinguish corridor and non-corridor selections when
 * navigating between location-based components.
 */
class LocationSelectionType extends Enum {}
LocationSelectionType.init([
  'CORRIDOR',
  'POINTS',
]);

/**
 * Map zoom hierarchy.  These are divided into three "levels", corresponding to zoom level
 * ranges in which different features make sense:
 *
 * - Level 3: city-wide;
 * - Level 2: ward level;
 * - Level 1: neighbourhood / block level.
 */
class MapZoom extends Enum {
  get maxzoomSource() {
    return this.maxzoomLayer - 1;
  }
}
MapZoom.init({
  LEVEL_3: {
    minzoom: 10,
    maxzoomLayer: 14,
  },
  LEVEL_2: {
    minzoom: 14,
    maxzoomLayer: 17,
  },
  LEVEL_1: {
    minzoom: 17,
    maxzoomLayer: 20,
  },
});
MapZoom.MIN = MapZoom.LEVEL_3.minzoom;
MapZoom.MAX = MapZoom.LEVEL_1.maxzoomSource;

const MAX_LOCATIONS = 5;

const ORG_NAME = 'Transportation Services';

/**
 * Page orientations for printed documents.  Used by {@link MovePdfGenerator} to
 * render reports to pages, but can be used anywhere you want to print something.
 *
 * @param {string} pdfkitLayout - value passed to the `pageOrientation` option for
 * `pdfmake`.
 */
class PageOrientation extends Enum {}
PageOrientation.init({
  LANDSCAPE: {
    pdfkitLayout: 'landscape',
  },
  PORTRAIT: {
    pdfkitLayout: 'portrait',
  },
});

/**
 * By typographical convention, a point is 1/72 of an inch.  Many media (both
 * online and offline, including PDF) adhere to this convention.
 *
 * @type {number}
 * @see https://en.wikipedia.org/wiki/Point_(typography)#Current_DTP_point_system
 */
const PT_PER_IN = 72;

/**
 * Page sizes for printed documents.  Used by {@link MovePdfGenerator} to
 * render reports to pages, but can be used anywhere you want to print something.
 *
 * In landscape mode, the `height` and `width` are swapped.
 *
 * @param {number} height - height in points, in portrait mode
 * @param {number} width - width in points, in portrait mode
 */
class PageSize extends Enum {}
PageSize.init({
  LETTER: {
    height: 11 * PT_PER_IN,
    width: 8.5 * PT_PER_IN,
  },
  LEGAL: {
    height: 14 * PT_PER_IN,
    width: 8.5 * PT_PER_IN,
  },
});

/**
 * Radius for point-of-interest searches.
 *
 * @type {number}
 */
const POI_RADIUS = 500;

/**
 * Report "content blocks" that MOVE Reporter uses in its report generation process.
 * {@link FormatGenerator.pdf} renders blocks to PDF, while the `FcWebReport` component
 * renders blocks for display in the browser.
 *
 * @see {@link FormatGenerator}
 * @see {@link ReportFormat}
 * @param {string} suffix - suffix for components / classes
 */
class ReportBlock extends Enum {}
ReportBlock.init({
  BAR_CHART: {
    suffix: 'BarChart',
  },
  METADATA: {
    suffix: 'Metadata',
  },
  PAGE_BREAK: {
    suffix: 'PageBreak',
  },
  TABLE: {
    suffix: 'Table',
  },
});

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
  WEB: {
    extension: 'json',
    mimeType: 'application/json',
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
      return state.now.year - 3;
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
 * @param {Array<ReportFormat>}  formats - formats supported for this report type
 * @param {string} label - human-readable name of this report type
 * @param {Object?} options - user-supplied options for this report type
 * @param {PageOrientation} orientation - page orientation for PDF documents
 * @param {boolean} tmcRelated - does this report type require TMC data?
 * @param {PageSize} size - page size for PDF documents
 * @param {boolean} speedRelated - does this report type require speed data?
 * @param {string} suffix - suffix used for component names
 */
class ReportType extends Enum {}
ReportType.init({
  COLLISION_DIRECTORY: {
    disabled: false,
    formats: [ReportFormat.CSV, ReportFormat.PDF],
    label: 'Directory Report',
    orientation: PageOrientation.LANDSCAPE,
    size: PageSize.LEGAL,
    suffix: 'CollisionDirectory',
  },
  COLLISION_TABULATION: {
    disabled: false,
    formats: [ReportFormat.PDF],
    label: 'Tabulation Report',
    orientation: PageOrientation.LANDSCAPE,
    size: PageSize.LETTER,
    suffix: 'CollisionTabulation',
  },
  COUNT_SUMMARY_24H: {
    disabled: false,
    formats: [ReportFormat.CSV, ReportFormat.PDF],
    label: '24-Hour Summary Report',
    orientation: PageOrientation.LANDSCAPE,
    tmcRelated: false,
    size: PageSize.LETTER,
    speedRelated: false,
    suffix: 'CountSummary24h',
  },
  COUNT_SUMMARY_24H_DETAILED: {
    disabled: false,
    formats: [ReportFormat.CSV, ReportFormat.PDF],
    label: '24-Hour Detailed Report',
    orientation: PageOrientation.PORTRAIT,
    tmcRelated: false,
    size: PageSize.LETTER,
    speedRelated: false,
    suffix: 'CountSummary24hDetailed',
  },
  COUNT_SUMMARY_24H_GRAPHICAL: {
    disabled: false,
    formats: [ReportFormat.CSV, ReportFormat.PDF],
    label: '24-Hour Graphical Report',
    orientation: PageOrientation.PORTRAIT,
    tmcRelated: false,
    size: PageSize.LETTER,
    speedRelated: false,
    suffix: 'CountSummary24hGraphical',
  },
  COUNT_SUMMARY_TURNING_MOVEMENT: {
    disabled: false,
    formats: [ReportFormat.CSV, ReportFormat.PDF],
    label: 'TMC Summary Report',
    orientation: PageOrientation.LANDSCAPE,
    tmcRelated: true,
    size: PageSize.LEGAL,
    speedRelated: false,
    suffix: 'CountSummaryTurningMovement',
  },
  COUNT_SUMMARY_TURNING_MOVEMENT_DETAILED: {
    disabled: false,
    formats: [ReportFormat.CSV, ReportFormat.PDF],
    label: 'TMC Detailed Report',
    orientation: PageOrientation.PORTRAIT,
    tmcRelated: true,
    size: PageSize.LETTER,
    speedRelated: false,
    suffix: 'CountSummaryTurningMovementDetailed',
  },
  COUNT_SUMMARY_TURNING_MOVEMENT_ILLUSTRATED: {
    disabled: true,
    formats: [],
    label: 'TMC Illustrated Report',
    orientation: PageOrientation.PORTRAIT,
    tmcRelated: true,
    size: PageSize.LETTER,
    speedRelated: false,
    suffix: 'CountSummaryTurningMovementIllustrated',
  },
  CROSSWALK_OBSERVANCE_SUMMARY: {
    disabled: true,
    formats: [ReportFormat.CSV, ReportFormat.PDF],
    label: 'Crosswalk Observation Report',
    orientation: PageOrientation.LANDSCAPE,
    tmcRelated: false,
    size: PageSize.LETTER,
    speedRelated: false,
    suffix: 'CrosswalkObservanceSummary',
  },
  INTERSECTION_SUMMARY: {
    disabled: false,
    formats: [ReportFormat.CSV, ReportFormat.PDF],
    label: 'Intersection Summary Report',
    orientation: PageOrientation.LANDSCAPE,
    tmcRelated: true,
    size: PageSize.LETTER,
    speedRelated: false,
    suffix: 'IntersectionSummary',
  },
  PED_DELAY_SUMMARY: {
    disabled: true,
    formats: [],
    label: 'Ped Delay Summary',
    orientation: PageOrientation.LANDSCAPE,
    tmcRelated: false,
    size: PageSize.LETTER,
    speedRelated: false,
    suffix: 'PedDelaySummary',
  },
  SPEED_PERCENTILE: {
    disabled: false,
    formats: [ReportFormat.CSV, ReportFormat.PDF],
    label: 'Speed Percentile Report',
    orientation: PageOrientation.LANDSCAPE,
    tmcRelated: false,
    size: PageSize.LETTER,
    speedRelated: true,
    suffix: 'SpeedPercentile',
  },
  WARRANT_TRAFFIC_SIGNAL_CONTROL: {
    disabled: false,
    formats: [ReportFormat.PDF],
    label: 'Warrant: Traffic Signal Control',
    options: {
      adequateTrial: ReportParameter.BOOLEAN,
      preparedBy: ReportParameter.USERNAME,
      preventablesByYear: ReportParameter.PREVENTABLE_COLLISIONS,
      startYear: ReportParameter.DATE_YEAR,
    },
    orientation: PageOrientation.PORTRAIT,
    tmcRelated: true,
    size: PageSize.LETTER,
    speedRelated: false,
    suffix: 'WarrantTrafficSignalControl',
  },
});

/**
 * Road intersection types, according to the City of Toronto Road Classification System.
 *
 * @param {number} featureCode - numeric code for this intersection type
 * @param {string} description - human-readable description of this intersection type
 * @see https://www.toronto.ca/services-payments/streets-parking-transportation/traffic-management/road-classification-system/about-the-road-classification-system/
 */
class RoadIntersectionType extends Enum {}
RoadIntersectionType.init({
  EXPRESSWAY: {
    featureCode: 501100,
    description: 'Expressway Intersection',
  },
  MAJOR: {
    featureCode: 501200,
    description: 'Major Intersection',
  },
  MINOR: {
    featureCode: 501300,
    description: 'Minor Intersection',
  },
  LANEWAY: {
    featureCode: 501700,
    description: 'Laneway Intersection',
  },
});

/**
 * Road segment types, according to the City of Toronto Road Classification System.
 *
 * @param {number} featureCode - numeric code for this segment class
 * @param {string} description - human-readable description of this segment class
 * @see https://www.toronto.ca/services-payments/streets-parking-transportation/traffic-management/road-classification-system/about-the-road-classification-system/
 */
class RoadSegmentType extends Enum {}
RoadSegmentType.init({
  EXPRESSWAY: {
    featureCode: 201100,
    description: 'Expressway',
  },
  EXPRESSWAY_RAMP: {
    featureCode: 201101,
    description: 'Expressway Ramp',
  },
  MAJOR_ARTERIAL: {
    featureCode: 201200,
    description: 'Major Arterial Road',
  },
  MAJOR_ARTERIAL_RAMP: {
    featureCode: 201201,
    description: 'Major Arterial Ramp',
  },
  MINOR_ARTERIAL: {
    featureCode: 201300,
    description: 'Minor Arterial Road',
  },
  MINOR_ARTERIAL_RAMP: {
    featureCode: 201301,
    description: 'Minor Arterial Ramp',
  },
  COLLECTOR: {
    featureCode: 201400,
    description: 'Collector Road',
  },
  COLLECTOR_RAMP: {
    featureCode: 201401,
    description: 'Collector Ramp',
  },
  LOCAL: {
    featureCode: 201500,
    description: 'Local Road',
  },
  OTHER: {
    featureCode: 201600,
    description: 'Other Road',
  },
  OTHER_RAMP: {
    featureCode: 201601,
    description: 'Other Ramp',
  },
  LANEWAY: {
    featureCode: 201700,
    description: 'Laneway',
  },
  PENDING: {
    featureCode: 201800,
    description: 'Pending',
  },
});

const FEATURE_CODES_INTERSECTION = RoadIntersectionType.enumValues
  .map(({ featureCode }) => featureCode);
const FEATURE_CODES_SEGMENT = RoadSegmentType.enumValues
  .map(({ featureCode }) => featureCode);

const SearchKeys = {
  Requests: {
    ASSIGNED_TO: (q, r) => {
      const qLower = q.toLowerCase();
      let rLower = 'none';
      if (r.studyRequest.assignedTo) {
        rLower = r.studyRequest.assignedTo.text.toLowerCase();
      }
      return rLower.indexOf(qLower) !== -1;
    },
    CREATED_AT: (q, r) => {
      const qLower = q.toLowerCase();
      const createdAtStr = TimeFormatters.formatDefault(r.studyRequest.createdAt);
      const rLower = createdAtStr.toLowerCase();
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
      const rLower = r.requestedBy.toLowerCase();
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
  Requests: {
    ASSIGNED_TO:
      r => (r.studyRequest.assignedTo === null
        ? -1 : r.studyRequest.assignedTo.ordinal),
    CREATED_AT: r => r.studyRequest.createdAt.valueOf(),
    DUE_DATE: r => r.studyRequest.dueDate.valueOf(),
    ID: r => r.id,
    LAST_EDITED_AT:
      r => (r.studyRequest.lastEditedAt === null
        ? -Infinity : r.studyRequest.lastEditedAt.valueOf()),
    LOCATION: r => r.location.description,
    REQUESTER: r => r.requestedBy,
    STATUS: r => r.studyRequest.status.ordinal,
    STUDY_TYPE: r => r.studyRequest.studyType.label,
    URGENT: r => (r.studyRequest.urgent ? 1 : 0),
  },
  Users: {
    UNIQUE_NAME: u => u.uniqueName,
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

/**
 * Possible Turning Movement Count schedules.
 *
 * @param {string} countType - 0- or 1-character code for the given schedule
 * @param {string} description - human-readable description of the given schedule
 * @param {Array} times - time ranges that make up the given schedule
 */
class StudyHours extends Enum {
  get hint() {
    if (this === StudyHours.OTHER) {
      return 'Please specify your desired schedule below';
    }
    const { times } = this;
    const timesParts = times.map(([start, end]) => `${start} -- ${end}`);
    return timesParts.join(', ');
  }
}
StudyHours.init({
  ROUTINE: {
    countType: 'R',
    description: 'Routine',
    times: [
      ['07:30', '09:30'],
      ['10:00', '12:00'],
      ['13:00', '15:00'],
      ['16:00', '18:00'],
    ],
  },
  SCHOOL: {
    countType: 'P',
    description: 'School',
    times: [
      ['07:30', '09:30'],
      ['10:00', '11:00'],
      ['12:00', '13:30'],
      ['14:15', '15:45'],
      ['16:00', '18:00'],
    ],
  },
  /*
   * OTHER is a placeholder schedule for any Turning Movement Schedule that
   * isn't captured by other values here.
   */
  OTHER: {
    countType: '',
    description: 'Other',
    times: [],
  },
});

/**
 * Groups to which a study request can be assigned for completion.
 *
 * This lists groups with whom the City has a pre-existing contract for study request
 * fulfillment.  This list changes infrequently enough that moving these to database,
 * providing admin controls for management thereof, and testing / maintaining all of
 * the above doesn't currently provide enough benefit to justify the design and
 * development effort that would require.
 *
 * That said: we should reassess later as these contracts are renegotiated, and as
 * we learn more about the process and time frame for regular production deployments.
 *
 * @param {string} text - short human-readable description of the group
 */
class StudyRequestAssignee extends Enum {}
StudyRequestAssignee.init({
  FIELD_STAFF: {
    text: 'Field Staff',
  },
  OTI: {
    text: 'OTI',
  },
});

/**
 * Reasons for submitting a study request.
 */
class StudyRequestReason extends Enum {}
StudyRequestReason.init({
  AWS: {
    text: 'All-Way Stop',
  },
  CYCLIST_SAFETY: {
    text: 'Cyclist Safety',
  },
  EXPIRED: {
    text: 'Updated count (3 years expired)',
  },
  PED_SAFETY: {
    text: 'Pedestrian Safety',
  },
  PXO: {
    text: 'Pedestrian Crossover (PXO)',
  },
  SIGNAL_TIMING: {
    text: 'Signal Timing',
  },
  TSC: {
    text: 'Traffic Signal Control',
  },
});

/**
 * Possible status codes for study requests.
 */
class StudyRequestStatus extends Enum {
  canTransitionTo(status) {
    return this.transitionsTo.includes(status);
  }
}
StudyRequestStatus.init({
  REQUESTED: {
    color: 'statusRequested',
    dataViewable: false,
    detailsIndex: 0,
    editable: true,
    text: 'Requested',
    get transitionsTo() {
      return [
        StudyRequestStatus.CHANGES_NEEDED,
        StudyRequestStatus.CANCELLED,
        StudyRequestStatus.ASSIGNED,
      ];
    },
  },
  CHANGES_NEEDED: {
    color: 'statusChangesNeeded',
    dataViewable: false,
    detailsIndex: 1,
    editable: true,
    text: 'Changes Needed',
    get transitionsTo() {
      return [
        StudyRequestStatus.REQUESTED,
        StudyRequestStatus.CANCELLED,
        StudyRequestStatus.ASSIGNED,
      ];
    },
  },
  CANCELLED: {
    color: 'statusCancelled',
    dataViewable: false,
    detailsIndex: 1,
    editable: false,
    text: 'Cancelled',
    get transitionsTo() {
      return [
        StudyRequestStatus.REQUESTED,
      ];
    },
  },
  ASSIGNED: {
    color: 'statusAssigned',
    dataViewable: false,
    detailsIndex: 2,
    editable: false,
    text: 'Assigned',
    get transitionsTo() {
      return [
        StudyRequestStatus.REQUESTED,
        StudyRequestStatus.COMPLETED,
      ];
    },
  },
  REJECTED: {
    color: 'statusRejected',
    dataViewable: false,
    detailsIndex: 3,
    editable: false,
    text: 'Rejected',
    get transitionsTo() {
      return [];
    },
  },
  COMPLETED: {
    color: 'statusCompleted',
    dataViewable: true,
    detailsIndex: 4,
    editable: false,
    text: 'Completed',
    get transitionsTo() {
      return [];
    },
  },
});

const OPTIONS_REPORTS_ATR_VOLUME = [
  ReportType.COUNT_SUMMARY_24H_GRAPHICAL,
  ReportType.COUNT_SUMMARY_24H_DETAILED,
  ReportType.COUNT_SUMMARY_24H,
];

/**
 * Types of studies that can be performed.
 */
class StudyType extends Enum {}
StudyType.init({
  ATR_SPEED_VOLUME: {
    label: 'Speed / Volume ATR',
    automatic: true,
    reportTypes: [
      ReportType.SPEED_PERCENTILE,
      ...OPTIONS_REPORTS_ATR_VOLUME,
    ],
  },
  ATR_VOLUME: {
    label: 'Volume ATR',
    automatic: true,
    reportTypes: OPTIONS_REPORTS_ATR_VOLUME,
  },
  ATR_VOLUME_BICYCLE: {
    label: 'Bicycle Volume ATR',
    automatic: true,
    reportTypes: OPTIONS_REPORTS_ATR_VOLUME,
  },
  PED_DELAY: {
    label: 'Ped Delay and Classification',
    automatic: false,
    reportTypes: [
      ReportType.PED_DELAY_SUMMARY,
    ],
  },
  PXO_OBSERVE: {
    label: 'Ped Crossover Observation',
    automatic: false,
    reportTypes: [
      ReportType.CROSSWALK_OBSERVANCE_SUMMARY,
    ],
  },
  RESCU: {
    label: 'RESCU (Highway / Ramp)',
    automatic: true,
    reportTypes: OPTIONS_REPORTS_ATR_VOLUME,
  },
  TMC: {
    label: 'Turning Movement Count',
    automatic: false,
    reportTypes: [
      ReportType.COUNT_SUMMARY_TURNING_MOVEMENT,
      ReportType.COUNT_SUMMARY_TURNING_MOVEMENT_DETAILED,
      ReportType.INTERSECTION_SUMMARY,
      ReportType.WARRANT_TRAFFIC_SIGNAL_CONTROL,
    ],
  },
});

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

const Constants = {
  AuthScope,
  CardinalDirection,
  centrelineKey,
  CentrelineType,
  CollisionEmphasisArea,
  CollisionRoadSurfaceCondition,
  FeatureCode,
  FEATURE_CODES_INTERSECTION,
  FEATURE_CODES_SEGMENT,
  HttpStatus,
  LocationMode,
  LocationSearchType,
  LocationSelectionType,
  MapZoom,
  MAX_LOCATIONS,
  ORG_NAME,
  PageOrientation,
  PageSize,
  POI_RADIUS,
  PT_PER_IN,
  ReportBlock,
  ReportFormat,
  ReportParameter,
  ReportType,
  RoadIntersectionType,
  RoadSegmentType,
  SearchKeys,
  SignalType,
  SortDirection,
  SortKeys,
  SPEED_CLASSES,
  StudyHours,
  StudyRequestAssignee,
  StudyRequestReason,
  StudyRequestStatus,
  StudyType,
  TMC_MODES_NON_VEHICLE,
  TMC_MODES_VEHICLE,
  TurningMovement,
};
export {
  Constants as default,
  AuthScope,
  CardinalDirection,
  centrelineKey,
  CentrelineType,
  CollisionEmphasisArea,
  CollisionRoadSurfaceCondition,
  FeatureCode,
  FEATURE_CODES_INTERSECTION,
  FEATURE_CODES_SEGMENT,
  HttpStatus,
  LocationMode,
  LocationSearchType,
  LocationSelectionType,
  MapZoom,
  MAX_LOCATIONS,
  ORG_NAME,
  PageOrientation,
  PageSize,
  POI_RADIUS,
  PT_PER_IN,
  ReportBlock,
  ReportFormat,
  ReportParameter,
  ReportType,
  RoadIntersectionType,
  RoadSegmentType,
  SearchKeys,
  SignalType,
  SortDirection,
  SortKeys,
  SPEED_CLASSES,
  StudyHours,
  StudyRequestAssignee,
  StudyRequestReason,
  StudyRequestStatus,
  StudyType,
  TMC_MODES_NON_VEHICLE,
  TMC_MODES_VEHICLE,
  TurningMovement,
};
