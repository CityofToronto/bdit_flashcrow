import { formatCombinedStreet } from '@/lib/StringFormatters';
import db from '@/lib/db/db';
import DateTime from '@/lib/time/DateTime';

const INVAGE_BUCKET = 5;

const COLLISION_EVENT_FIELDS = `
  e.collision_id,
  e.accdate, e.acctime,
  e.stname1, e.streetype1, e.dir1,
  e.stname2, e.streetype2, e.dir2,
  e.stname3, e.streetype3, e.dir3,
  e.longitude, e.latitude,
  ec.centreline_id, ec.centreline_type
  FROM collisions.events e
  JOIN collisions.events_centreline ec ON e.collision_id = ec.collision_id`;

function normalizeEvent({
  collision_id: collisionId,
  accdate,
  acctime,
  stname1: street1Name,
  streetype1: street1Type,
  dir1: street1Dir,
  stname2: street2Name,
  streetype2: street2Type,
  dir2: street2Dir,
  stname3: street3Name,
  streetype3: street3Type,
  dir3: street3Dir,
  longitude: lng,
  latitude: lat,
  centreline_id: centrelineId,
  centreline_type: centrelineType,
}) {
  let dateTime = DateTime.fromJSON(accdate);
  const hhmm = parseInt(acctime, 10);
  const hour = Math.floor(hhmm / 100);
  const minute = hhmm % 100;
  dateTime = dateTime.set({ hour, minute });

  const street1 = formatCombinedStreet(street1Name, street1Type, street1Dir);
  const street2 = formatCombinedStreet(street2Name, street2Type, street2Dir);
  const street3 = formatCombinedStreet(street3Name, street3Type, street3Dir);

  return {
    collisionId,
    dateTime,
    street1,
    street2,
    street3,
    lng,
    lat,
    centrelineId,
    centrelineType,
  };
}

function normalizeInvolved(involved) {
  let { invtype, invage } = involved;
  invtype = parseInt(invtype, 10);
  invage = Math.floor(invage / INVAGE_BUCKET) * INVAGE_BUCKET;
  return { invtype, invage };
}

class CollisionDAO {
  static async byIdPopupDetails(id) {
    const sqlEvent = `SELECT ${COLLISION_EVENT_FIELDS} WHERE e.collision_id = $(id)`;
    let event = await db.oneOrNone(sqlEvent, { id });
    if (event === null) {
      return { event: null, involved: [] };
    }
    event = normalizeEvent(event);
    const sqlInvolved = `
SELECT invtype, invage
FROM collisions.involved
WHERE collision_id = $(id)`;
    const rows = await db.manyOrNone(sqlInvolved, { id });
    const involved = rows.map(normalizeInvolved);
    return { event, involved };
  }

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
