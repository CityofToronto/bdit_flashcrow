const db = require('./db');

/**
 * Since the set of categories is small and static, we cache it here to reduce
 * DB load.
 */
let CACHE = null;

async function init() {
  CACHE = new Map();
  const categories = await db.many('SELECT * FROM "TRAFFIC"."CATEGORY"');
  categories.forEach(({ CATEGORY_ID: id, CATEGORY_NAME: name }) => {
    CACHE.set(id, { id, name });
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

module.exports = CategoryDAO;
