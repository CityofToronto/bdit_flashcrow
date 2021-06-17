import { StudyType } from '@/lib/Constants';
import db from '@/lib/db/db';

/*
 * TODO: eventually figure out what the right taxonomy is here - it's possible we're
 * lumping together things that don't belong together.
 */
const CATEGORY_STUDY_TYPES = {
  '24 HOUR': StudyType.ATR_VOLUME,
  RESCU: StudyType.RESCU,
  CLASS: null,
  SPEED: StudyType.ATR_SPEED_VOLUME,
  MANUAL: StudyType.TMC,
  // TODO: not sure about this next one
  'PERM STN': StudyType.ATR_VOLUME,
  BICYCLE: StudyType.ATR_VOLUME_BICYCLE,
  'SPD OCC': null,
  'SENSYS SPEED': null,
};

/*
 * Since the set of categories is small and static, we cache it here to reduce
 * DB load.
 */
let CACHE = null;

async function init() {
  CACHE = new Map();
  const categories = await db.many('SELECT * FROM "TRAFFIC"."CATEGORY"');
  categories.forEach(({ CATEGORY_ID: id, CATEGORY_NAME: name }) => {
    const studyType = CATEGORY_STUDY_TYPES[name];
    const category = { id, name, studyType };
    CACHE.set(id, category);
  });
}

/**
 * Data access object for "categories", as listed in `TRAFFIC.CATEGORY`.  These are types of
 * counts that legacy FLOW knows about.  With the introduction of new study types in MOVE, this
 * is being replaced by the use of {@link StudyType} in the new `counts2` database
 * schema.
 *
 * @deprecated
 */
class CategoryDAO {
  static isInited() {
    return CACHE !== null;
  }

  static async all() {
    if (!CategoryDAO.isInited()) {
      await init();
    }
    return CACHE;
  }

  static async byId(id) {
    if (!CategoryDAO.isInited()) {
      await init();
    }
    return CACHE.get(id);
  }
}

export default CategoryDAO;
