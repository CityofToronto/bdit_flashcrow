import db from '@/lib/db/db';

/**
 * Since the set of collision factors is small and static, we cache it here to reduce DB load.
 */
let CACHE = null;

async function init() {
  CACHE = new Map();

  const sqlTables = `
SELECT table_name AS "tableName"
FROM information_schema.tables
WHERE table_schema = 'collision_factors'`;
  const rowsTables = await db.manyOrNone(sqlTables);

  const sqlByTable = rowsTables.map(
    ({ tableName }) => `
SELECT
  "${tableName}"::smallint AS value,
  description,
  code
FROM collision_factors."${tableName}"
WHERE "${tableName}" IS NOT NULL
AND "${tableName}" ~ '^[0-9]+$'`,
  );
  const tasksByTable = sqlByTable.map(sql => db.manyOrNone(sql));
  const rowsByTable = await Promise.all(tasksByTable);

  rowsByTable.forEach((rows, i) => {
    const { tableName: field } = rowsTables[i];
    const fieldEntries = new Map();
    rows.forEach(({ code, description, value }) => {
      fieldEntries.set(value, { code, description });
    });
    CACHE.set(field, fieldEntries);
  });
}

class CollisionFactorDAO {
  static isInited() {
    return CACHE !== null;
  }

  static async all() {
    if (!CollisionFactorDAO.isInited()) {
      await init();
    }
    return CACHE;
  }
}

export default CollisionFactorDAO;
