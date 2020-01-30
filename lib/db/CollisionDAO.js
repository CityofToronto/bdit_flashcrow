import db from '@/lib/db/db';

class CollisionDAO {
  static async byCentrelineSummary(
    centrelineId,
    centrelineType,
    dateRange,
  ) {
    const params = { centrelineId, centrelineType };
    const filters = [
      'ec.centreline_id = $(centrelineId)',
      'ec.centreline_type = $(centrelineType)',
    ];
    if (dateRange !== null) {
      Object.assign(params, dateRange);
      filters.push('e.accdate >= $(start)');
      filters.push('e.accdate < $(end)');
    }
    const sqlFilters = filters.join('\n  AND ');
    const sql = `
WITH collisions AS (
  SELECT i.collision_id, MAX(CONCAT('0', i.injury)::int) AS injury
  FROM collisions.events e
  JOIN collisions.involved i ON e.collision_id = i.collision_id
  JOIN collisions.events_centreline ec ON e.collision_id = ec.collision_id
  WHERE ${sqlFilters}
  GROUP BY i.collision_id
)
SELECT
COUNT(*) AS total,
COUNT(*) FILTER (WHERE injury >= 3) AS ksi
FROM collisions`;
    return db.one(sql, params);
  }
}

export default CollisionDAO;
