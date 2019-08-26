import db from './db';

/*
 * TODO: DRY with Constants.js...or even better, put this metadata in the database
 * along with "TRAFFIC"."CATEGORY", so that we have an easily-extensible list of count
 * types!
 */
const COUNT_TYPES = [
  { label: 'Bicycle Volume ATR', value: 'ATR_VOLUME_BICYCLE', automatic: true },
  { label: 'Ped Crossover Observation', value: 'PXO_OBSERVE', automatic: false },
  { label: 'Ped Delay and Classification', value: 'PED_DELAY', automatic: false },
  { label: 'RESCU', value: 'RESCU', automatic: true },
  { label: 'Speed / Volume ATR', value: 'ATR_SPEED_VOLUME', automatic: true },
  { label: 'Turning Movement Count', value: 'TMC', automatic: false },
  { label: 'Volume ATR', value: 'ATR_VOLUME', automatic: true },
];

/*
 * TODO: eventually figure out what the right taxonomy is here - it's possible we're
 * lumping together things that don't belong together.
 */
const CATEGORY_COUNT_TYPES = {
  '24 HOUR': 'ATR_VOLUME',
  RESCU: 'RESCU',
  CLASS: null,
  SPEED: 'ATR_SPEED_VOLUME',
  MANUAL: 'TMC',
  // TODO: not sure about this next one
  'PERM STN': 'ATR_VOLUME',
  BICYCLE: 'ATR_VOLUME_BICYCLE',
  'SPD OCC': null,
  'SENSYS SPEED': null,
};

/**
 * Since the set of categories is small and static, we cache it here to reduce
 * DB load.
 */
let CACHE = null;

async function init() {
  CACHE = new Map();
  const categories = await db.many('SELECT * FROM "TRAFFIC"."CATEGORY"');
  categories.forEach(({ CATEGORY_ID: id, CATEGORY_NAME: name }) => {
    const categoryValue = CATEGORY_COUNT_TYPES[name];
    const category = { id, name };
    if (categoryValue !== null) {
      const countType = COUNT_TYPES.find(({ value }) => value === categoryValue);
      Object.assign(category, countType);
    }
    CACHE.set(id, category);
  });
}

class CategoryDAO {
  static async all() {
    if (CACHE === null) {
      await init();
    }
    return CACHE;
  }

  static async byId(id) {
    if (CACHE === null) {
      await init();
    }
    return CACHE.get(id);
  }
}

export default CategoryDAO;
