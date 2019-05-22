const COUNT_TYPES = [
  { label: 'Turning Movement Count', value: 'TMC', automatic: false },
  { label: 'Speed / Volume ATR', value: 'ATR_SPEED_VOLUME', automatic: true },
  { label: 'Pedestrian Delay and Classification', value: 'PED_DELAY', automatic: false },
  { label: 'Pedestrian Crossover Observation', value: 'PXO_OBSERVE', automatic: false },
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

const REASONS = [
  { label: 'Traffic Signal Control', value: 'TSC' },
  { label: 'Pedestrian Crossover (PXO)', value: 'PXO' },
  { label: 'Updated count (3 years expired)', value: 'EXPIRED' },
  { label: 'Pedestrian Safety', value: 'PED_SAFETY' },
  { label: 'Signal Timing', value: 'SIGNAL_TIMING' },
  { label: 'Other', value: null },
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
};

const Status = {
  RECENT: 0,
  OLD_3: 1,
  OLD_5: 2,
  NO_EXISTING_COUNT: 3,
  REQUEST_IN_PROGRESS: 4,
};

const STATUS_META = [
  'Recent',
  '3 years+',
  '5 years+',
  'No existing count',
  'Request in progress',
];

export default {
  COUNT_TYPES,
  DAYS_OF_WEEK,
  REASONS,
  SortDirection,
  SortKeys,
  Status,
  STATUS_META,
};
