import db from '@/lib/db/db';

/**
 * @typedef {Object} CollisionFactorEntry
 * @property {string} code - abbreviated description of the value, suitable for display in
 * small table cells
 * @property {string} description - human-readable description, suitable for display in larger
 * table cells, headings, etc.
 */

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

/**
 * Data access layer for collision factors.  Collision records use numeric codes for many of
 * their fields, as described on the MVCR reference sheet from the Ministry of Transportation
 * of Ontario (MTO).  A collision factor is the mapping from those numeric codes to
 * human-readable descriptions, so that the collision records can be more easily interpreted
 * without needing to consult that reference sheet.
 */
class CollisionFactorDAO {
  static isInited() {
    return CACHE !== null;
  }

  /**
   * @returns {Map<string, Map<number, CollisionFactorEntry>>} map with field names as keys, and
   * maps from numeric codes to {@link CollisionFactorEntry} entries as values
   */
  static async all() {
    if (!CollisionFactorDAO.isInited()) {
      await init();
    }
    return CACHE;
  }
}

export default CollisionFactorDAO;
