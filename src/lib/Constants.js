const COUNT_TYPES = [
  { label: 'Turning Movement Count', value: 'TMC', automatic: false },
  { label: 'Speed / Volume ATR', value: 'ATR_SPEED_VOLUME', automatic: true },
  { label: 'Pedestrian Delay and Classification', value: 'PED_DELAY', automatic: false },
  { label: 'Pedestrian Crossover Observation', value: 'PXO_OBSERVE', automatic: false },
  { label: 'Volume ATR', value: 'ATR_VOLUME', automatic: true },
];

const Status = {
  RECENT: 0,
  OLD_3: 1,
  NOT_IN_SYSTEM: 2,
  REQUEST_PENDING: 3,
};


export default {
  COUNT_TYPES,
  Status,
};
