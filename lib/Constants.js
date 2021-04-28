import { Enum } from '@/lib/ClassUtils';
import { STUDY_HOURS_HINT_OTHER } from '@/lib/i18n/Strings';

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
    description: 'Study Requests',
  },
  STUDY_REQUESTS_ADMIN: {
    description: 'Admin Study Requests',
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

/**
 * @param {Object} feature - centreline feature
 * @returns {string} a string key representing the given feature, suitable for use in
 * ES6 `Map` or `Set` instances
 */
function centrelineKey(feature) {
  const { centrelineId, centrelineType } = feature;
  return `${centrelineType}/${centrelineId}`;
}

/**
 * Types of features in the centreline.  These codes are used extensively throughout MOVE's
 * frontend, backend, and data pipelines to distinguish segments (midblocks) from intersections.
 *
 * For new code, we prefer the term "midblocks" to "segments", as the former makes it clearer
 * that this is specific to road networks.  When this was first written, though, we used
 * "segment".  (We might eventually change this here, but it's not a high priority.)
 */
const CentrelineType = {
  SEGMENT: 1,
  INTERSECTION: 2,
};

/**
 * Collision details that aren't related to the Vision Zero emphasis areas in
 * {@link CollisionEmphasisArea}.
 *
 * @param {string} field - which database column identifies collisions related to
 * this detail
 * @param {string} text - human-readable description of the detail
 */
class CollisionDetail extends Enum {}
CollisionDetail.init({
  DAMAGE_CITY_PROPERTY: {
    field: 'property_damage',
    text: 'Damage to City Property',
  },
  RED_LIGHT: {
    field: 'red_light',
    text: 'Running Red Light',
  },
});

/**
 * Vision Zero emphasis areas for collisions.
 *
 * @see https://www.toronto.ca/services-payments/streets-parking-transportation/road-safety/vision-zero/emphasis-areas/
 * @param {string} field - which database column identifies collisions related to
 * this emphasis area
 * @param {string} text - human-readable description of the emphasis area
 */
class CollisionEmphasisArea extends Enum {}
CollisionEmphasisArea.init({
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
  UNAUTHORIZED: {
    statusCode: 401,
  },
  FORBIDDEN: {
    statusCode: 403,
  },
  NOT_FOUND: {
    statusCode: 404,
  },
});

/**
 * Common keycodes for keyboard interactions.  These are primarily useful for addressing
 * a11y keyboard navigation issues.
 */
const KeyCode = {
  ENTER: 0x0a,
  SPACE: 0x20,
};

/**
 * Modes for the map legend.  `FOCUS_LOCATIONS` mode is used to hide extra detail when
 * selecting locations or submitting study requests, while `NORMAL` is used during normal
 * map navigation.
 */
class LegendMode extends Enum {}
LegendMode.init(['FOCUS_LOCATIONS', 'NORMAL']);

/**
 * Modes for the location selector.  In `SINGLE` mode, only a single location may be selected.
 * `MULTI_EDIT` is an edit mode for multi-location selection; in this mode, locations can be
 * added and removed from the selection, but these changes must be saved to take effect.  In
 * `MULTI` mode, multiple locations may be selected, but this multi-location selection cannot
 * be edited.
 *
 * @param {boolean} multi - whether this mode allows for multi-location selection
 */
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
 *
 * Layers in {@link GeoStyle} may use these constants to describe what data is shown at
 * each level, and how that data is shown.
 *
 * @param {number} minzoom - minimum Mapbox GL zoom level in this MOVE level (inclusive)
 * @param {number} maxzoomLayer - maximum Mapbox GL zoom level in this MOVE level (exclusive)
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

/**
 * Maximum number of locations that may be selected at once.
 *
 * This is a limit on _waypoints_.  If the user routes a corridor, for instance, they can select
 * up to `MAX_LOCATIONS` waypoints, but the corridor itself may contain more locations.  See
 * {@link CompositeId} for the maximum number of locations in a routed corridor.
 */
const MAX_LOCATIONS = 5;

/**
 * Official name of the organization / division that is responsible for data products and services
 * provided through MOVE.  This is primarily used in the "letterhead" for various reports.
 */
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
 * Report export modes available in Aggregate View on the View Data page.  This identifies
 * whether collision or study reports are being exported.
 *
 * @param {string} description - human-readable description explaining what is exported in
 * this mode
 */
class ReportExportMode extends Enum {}
ReportExportMode.init({
  COLLISIONS: {
    description: 'Collision Reports',
  },
  STUDIES: {
    description: 'Study Reports',
  },
});

/**
 * Report formats available from MOVE Reporter.
 *
 * @param {boolean} download - whether reports of this format should be downloaded; used to
 * set `Content-Disposition` header.
 * @param {string} extension - file extension for type
 * @param {string} mimeType - MIME type to return results under
 */
class ReportFormat extends Enum {}
ReportFormat.init({
  CSV: {
    download: true,
    extension: 'csv',
    mimeType: 'text/csv',
  },
  JSON: {
    download: false,
    extension: 'json',
    mimeType: 'application/json',
  },
  PDF: {
    download: true,
    extension: 'pdf',
    mimeType: 'application/pdf',
  },
  WEB: {
    download: false,
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
  DATE: {
    defaultValue({ state }) {
      return state.now.minus({ years: 3 });
    },
  },
  PREVENTABLE_COLLISIONS: {
    defaultValue() {
      return [0, 0, 0];
    },
  },
});

/**
 * Report types available from MOVE Reporter.
 *
 * @param {boolean} disabled - this report type is disabled if it hasn't been
 * implemented in MOVE Reporter yet
 * @param {Array<ReportFormat>} formats - formats supported for this report type
 * @param {string} label - human-readable name of this report type
 * @param {Object?} options - user-supplied options for this report type
 * @param {PageOrientation?} orientation - page orientation for PDF documents
 * (only if `ReportFormat.PDF` available)
 * @param {ReportExportMode?} reportExportMode - whether this is collision-related
 * or study-related (only if intended for viewing from View Reports)
 * @param {Array<AuthScope>?} scope - authorization scopes required (if any required)
 * @param {PageSize?} size - page size for PDF documents (only if `ReportFormat.PDF`
 * available)
 * @param {boolean?} speedRelated - does this report type require speed data? (only if
 * study-related)
 * @param {string} suffix - suffix used for component names
 * @param {boolean?} tmcRelated - does this report type require TMC data? (only if
 * study-related)
 */
class ReportType extends Enum {}
ReportType.init({
  COLLISION_DIRECTORY: {
    disabled: false,
    formats: [ReportFormat.CSV, ReportFormat.PDF],
    label: 'Directory Report',
    orientation: PageOrientation.LANDSCAPE,
    reportExportMode: ReportExportMode.COLLISIONS,
    size: PageSize.LEGAL,
    suffix: 'CollisionDirectory',
  },
  COLLISION_TABULATION: {
    disabled: false,
    formats: [ReportFormat.CSV, ReportFormat.PDF],
    label: 'Tabulation Report',
    orientation: PageOrientation.LANDSCAPE,
    reportExportMode: ReportExportMode.COLLISIONS,
    size: PageSize.LETTER,
    suffix: 'CollisionTabulation',
  },
  COUNT_SUMMARY_24H: {
    disabled: false,
    formats: [ReportFormat.CSV, ReportFormat.PDF],
    label: '24-Hour Summary Report',
    orientation: PageOrientation.LANDSCAPE,
    reportExportMode: ReportExportMode.STUDIES,
    size: PageSize.LETTER,
    speedRelated: false,
    suffix: 'CountSummary24h',
    tmcRelated: false,
  },
  COUNT_SUMMARY_24H_DETAILED: {
    disabled: false,
    formats: [ReportFormat.CSV, ReportFormat.PDF],
    label: '24-Hour Detailed Report',
    orientation: PageOrientation.PORTRAIT,
    reportExportMode: ReportExportMode.STUDIES,
    size: PageSize.LETTER,
    speedRelated: false,
    suffix: 'CountSummary24hDetailed',
    tmcRelated: false,
  },
  COUNT_SUMMARY_24H_GRAPHICAL: {
    disabled: false,
    formats: [ReportFormat.CSV, ReportFormat.PDF],
    label: '24-Hour Graphical Report',
    orientation: PageOrientation.LANDSCAPE,
    reportExportMode: ReportExportMode.STUDIES,
    size: PageSize.LETTER,
    speedRelated: false,
    suffix: 'CountSummary24hGraphical',
    tmcRelated: false,
  },
  COUNT_SUMMARY_TURNING_MOVEMENT: {
    disabled: false,
    formats: [ReportFormat.CSV, ReportFormat.PDF],
    label: 'TMC Summary Report',
    orientation: PageOrientation.LANDSCAPE,
    reportExportMode: ReportExportMode.STUDIES,
    size: PageSize.LETTER,
    speedRelated: false,
    suffix: 'CountSummaryTurningMovement',
    tmcRelated: true,
  },
  COUNT_SUMMARY_TURNING_MOVEMENT_DETAILED: {
    disabled: false,
    formats: [ReportFormat.CSV, ReportFormat.PDF],
    label: 'TMC Detailed Report',
    orientation: PageOrientation.PORTRAIT,
    reportExportMode: ReportExportMode.STUDIES,
    size: PageSize.LETTER,
    speedRelated: false,
    suffix: 'CountSummaryTurningMovementDetailed',
    tmcRelated: true,
  },
  COUNT_SUMMARY_TURNING_MOVEMENT_ILLUSTRATED: {
    disabled: true,
    formats: [],
    label: 'TMC Illustrated Report',
    orientation: PageOrientation.PORTRAIT,
    reportExportMode: ReportExportMode.STUDIES,
    size: PageSize.LETTER,
    speedRelated: false,
    suffix: 'CountSummaryTurningMovementIllustrated',
    tmcRelated: true,
  },
  CROSSWALK_OBSERVANCE_SUMMARY: {
    disabled: true,
    formats: [ReportFormat.CSV, ReportFormat.PDF],
    label: 'Crosswalk Observation Report',
    orientation: PageOrientation.LANDSCAPE,
    reportExportMode: ReportExportMode.STUDIES,
    size: PageSize.LETTER,
    speedRelated: false,
    suffix: 'CrosswalkObservanceSummary',
    tmcRelated: false,
  },
  INTERSECTION_SUMMARY: {
    disabled: false,
    formats: [ReportFormat.CSV, ReportFormat.PDF],
    label: 'Intersection Summary Report',
    orientation: PageOrientation.LANDSCAPE,
    reportExportMode: ReportExportMode.STUDIES,
    size: PageSize.LETTER,
    speedRelated: false,
    suffix: 'IntersectionSummary',
    tmcRelated: true,
  },
  PEAK_HOUR_FACTOR: {
    disabled: false,
    formats: [ReportFormat.CSV, ReportFormat.PDF],
    label: 'Peak Hour Factor Report',
    orientation: PageOrientation.LANDSCAPE,
    reportExportMode: ReportExportMode.STUDIES,
    size: PageSize.LETTER,
    speedRelated: false,
    suffix: 'PeakHourFactor',
    tmcRelated: true,
  },
  PED_DELAY_SUMMARY: {
    disabled: true,
    formats: [],
    label: 'Ped Delay Summary',
    orientation: PageOrientation.LANDSCAPE,
    reportExportMode: ReportExportMode.STUDIES,
    size: PageSize.LETTER,
    speedRelated: false,
    suffix: 'PedDelaySummary',
    tmcRelated: false,
  },
  SPEED_PERCENTILE: {
    disabled: false,
    formats: [ReportFormat.CSV, ReportFormat.PDF],
    label: 'Speed Percentile Report',
    orientation: PageOrientation.LANDSCAPE,
    reportExportMode: ReportExportMode.STUDIES,
    size: PageSize.LETTER,
    speedRelated: true,
    suffix: 'SpeedPercentile',
    tmcRelated: false,
  },
  TRACK_REQUESTS: {
    disabled: false,
    formats: [ReportFormat.CSV],
    label: 'Track Requests',
    scope: [AuthScope.STUDY_REQUESTS],
    suffix: 'TrackRequests',
  },
  WARRANT_TRAFFIC_SIGNAL_CONTROL: {
    disabled: false,
    formats: [ReportFormat.PDF],
    label: 'Warrant: Traffic Control Signal',
    options: {
      adequateTrial: ReportParameter.BOOLEAN,
      isTwoLane: ReportParameter.BOOLEAN,
      isXIntersection: ReportParameter.BOOLEAN,
      preventablesByYear: ReportParameter.PREVENTABLE_COLLISIONS,
      startDate: ReportParameter.DATE,
    },
    orientation: PageOrientation.PORTRAIT,
    reportExportMode: ReportExportMode.STUDIES,
    size: PageSize.LETTER,
    speedRelated: false,
    suffix: 'WarrantTrafficSignalControl',
    tmcRelated: true,
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
  UNKNOWN: {
    featureCode: 0,
    description: 'Intersection',
  },
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
  RAILWAY: {
    featureCode: 502000,
    description: 'Railway Intersection',
  },
  PEDESTRIAN: {
    featureCode: 504000,
    description: 'Pedestrian Intersection',
  },
  CUL_DE_SAC: {
    featureCode: 509100,
    description: 'Cul-de-sac Intersection',
  },
  PSEUDO: {
    featureCode: 509200,
    description: 'Pseudo-Intersection',
  },
  UTILITY: {
    featureCode: 509300,
    description: 'Utility Intersection',
  },
  RIVER: {
    featureCode: 509400,
    description: 'River Intersection',
  },
  NONE: {
    featureCode: 509900,
    description: 'No Intersection',
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
  BUSWAY: {
    featureCode: 201801,
    description: 'Busway',
  },
  ACCESS_ROAD: {
    featureCode: 201803,
    description: 'Access Road',
  },
});

const FEATURE_CODES_INTERSECTION = RoadIntersectionType.enumValues
  .map(({ featureCode }) => featureCode);
const FEATURE_CODES_SEGMENT = RoadSegmentType.enumValues
  .map(({ featureCode }) => featureCode);

/**
 * Used to define sorting directions.  You can use these constants with
 * {@link ArrayUtils.sortBy} to describe whether sorting should be ascending
 * or descending.
 */
const SortDirection = {
  ASC: 1,
  DESC: -1,
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
      return STUDY_HOURS_HINT_OTHER;
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
    descriptionCsv: 'ROUTINE',
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
    descriptionCsv: 'SCHOOL (PED) HOURS',
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
    descriptionCsv: null,
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
 *
 * @param {string} text - human-readable description of reason
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
    text: 'Expired / Older Count',
  },
  PED_SAFETY: {
    text: 'Pedestrian Safety',
  },
  PXO: {
    text: 'Pedestrian Crossover',
  },
  SIGNAL_TIMING: {
    text: 'Signal Timing',
  },
  TSC: {
    text: 'Traffic Control Signal',
  },
  OTHER: {
    text: 'Other',
  },
});

/**
 * Possible status codes for study requests.
 */
class StudyRequestStatus extends Enum {}
StudyRequestStatus.init({
  REQUESTED: {
    color: 'statusRequested',
    dataViewable: false,
    detailsIndex: 0,
    editable: true,
    text: 'Requested',
    textVerb: 'reopen',
    textVerbPastTense: 'reopened',
  },
  CHANGES_NEEDED: {
    color: 'statusChangesNeeded',
    dataViewable: false,
    detailsIndex: 1,
    editable: true,
    text: 'Changes Needed',
    textVerb: 'request changes for',
    textVerbPastTense: 'returned to submitter for changes',
  },
  CANCELLED: {
    color: 'statusCancelled',
    dataViewable: false,
    detailsIndex: 1,
    editable: false,
    text: 'Cancelled',
    textVerb: 'cancel',
    textVerbPastTense: 'cancelled',
  },
  ASSIGNED: {
    color: 'statusAssigned',
    dataViewable: false,
    detailsIndex: 2,
    editable: false,
    text: 'Assigned',
    textVerb: 'assign',
    textVerbPastTense: 'assigned',
  },
  REJECTED: {
    color: 'statusRejected',
    dataViewable: false,
    detailsIndex: 3,
    editable: false,
    text: 'Rejected',
    textVerb: 'reject',
    textVerbPastTense: 'rejected',
  },
  COMPLETED: {
    color: 'statusCompleted',
    dataViewable: true,
    detailsIndex: 4,
    editable: false,
    text: 'Completed',
    textVerb: 'complete',
    textVerbPastTense: 'completed',
  },
});

const OPTIONS_REPORTS_ATR_VOLUME = [
  ReportType.COUNT_SUMMARY_24H_GRAPHICAL,
  ReportType.COUNT_SUMMARY_24H_DETAILED,
  ReportType.COUNT_SUMMARY_24H,
];

/**
 * Types of studies that can be performed.  This list includes two "other" types,
 * `OTHER_AUTOMATIC` and `OTHER_MANUAL`, that allow staff to request studies that aren't covered
 * under other types.
 *
 * Some specific types, such as `PED_DELAY`, can be requested but do not yet have data available
 * in MOVE.
 *
 * @param {string} label - human-readable description of study type
 * @param {boolean} automatic - whether data for this study type is collected automatically
 * (or, if `false`, manually)
 * @param {boolean} dataAvailable - whether data for this study type is available in MOVE
 * @param {boolean} other - whether this study type is an "other" type
 * @param {Array<ReportType>} reportTypes - report types that are available for this study type
 */
class StudyType extends Enum {}
StudyType.init({
  ATR_SPEED_VOLUME: {
    label: 'Speed / Volume ATR',
    automatic: true,
    dataAvailable: true,
    other: false,
    reportTypes: [
      ReportType.SPEED_PERCENTILE,
      ...OPTIONS_REPORTS_ATR_VOLUME,
    ],
  },
  ATR_VOLUME: {
    label: 'Volume ATR',
    automatic: true,
    dataAvailable: true,
    other: false,
    reportTypes: OPTIONS_REPORTS_ATR_VOLUME,
  },
  ATR_VOLUME_BICYCLE: {
    label: 'Bicycle Volume ATR',
    automatic: true,
    dataAvailable: true,
    other: false,
    reportTypes: OPTIONS_REPORTS_ATR_VOLUME,
  },
  OTHER_AUTOMATIC: {
    label: 'Other',
    automatic: true,
    dataAvailable: false,
    other: true,
    reportTypes: [],
  },
  OTHER_MANUAL: {
    label: 'Other',
    automatic: false,
    dataAvailable: false,
    other: true,
    reportTypes: [],
  },
  PED_DELAY: {
    label: 'Ped Delay and Classification',
    automatic: false,
    dataAvailable: false,
    other: false,
    reportTypes: [
      ReportType.PED_DELAY_SUMMARY,
    ],
  },
  PXO_OBSERVE: {
    label: 'Ped Crossover Observation',
    automatic: false,
    dataAvailable: false,
    other: false,
    reportTypes: [
      ReportType.CROSSWALK_OBSERVANCE_SUMMARY,
    ],
  },
  RESCU: {
    label: 'RESCU (Highway / Ramp)',
    automatic: true,
    dataAvailable: true,
    other: false,
    reportTypes: OPTIONS_REPORTS_ATR_VOLUME,
  },
  TMC: {
    label: 'Turning Movement Count',
    automatic: false,
    dataAvailable: true,
    other: false,
    reportTypes: [
      ReportType.COUNT_SUMMARY_TURNING_MOVEMENT,
      ReportType.COUNT_SUMMARY_TURNING_MOVEMENT_DETAILED,
      ReportType.INTERSECTION_SUMMARY,
      ReportType.PEAK_HOUR_FACTOR,
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
  LEFT: {
    header: 'Left',
    short: 'L',
  },
  THRU: {
    header: 'Thru',
    short: 'T',
  },
  RIGHT: {
    header: 'Right',
    short: 'R',
  },
});

const Constants = {
  AuthScope,
  CardinalDirection,
  centrelineKey,
  CentrelineType,
  CollisionDetail,
  CollisionEmphasisArea,
  FEATURE_CODES_INTERSECTION,
  FEATURE_CODES_SEGMENT,
  HttpStatus,
  KeyCode,
  LegendMode,
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
  ReportExportMode,
  ReportFormat,
  ReportParameter,
  ReportType,
  RoadIntersectionType,
  RoadSegmentType,
  SortDirection,
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
  CollisionDetail,
  CollisionEmphasisArea,
  FEATURE_CODES_INTERSECTION,
  FEATURE_CODES_SEGMENT,
  HttpStatus,
  KeyCode,
  LegendMode,
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
  ReportExportMode,
  ReportFormat,
  ReportParameter,
  ReportType,
  RoadIntersectionType,
  RoadSegmentType,
  SortDirection,
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
