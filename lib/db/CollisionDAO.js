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

function getCollisionFilters(
  centrelineType,
  centrelineId,
  dateRange,
  daysOfWeek,
  emphasisAreas,
  hoursOfDay,
  roadSurfaceConditions,
) {
  const params = { centrelineId, centrelineType };
  const filters = [
    'ec.centreline_id = $(centrelineId)',
    'ec.centreline_type = $(centrelineType)',
  ];
  if (dateRange !== null) {
    params.dateRangeStart = dateRange.start;
    params.dateRangeEnd = dateRange.end;
    filters.push('e.accdate >= $(dateRangeStart)');
    filters.push('e.accdate < $(dateRangeEnd)');
  }
  if (daysOfWeek !== null) {
    params.daysOfWeek = daysOfWeek;
    filters.push('date_part(\'DOW\', e.accdate) IN ($(daysOfWeek:csv))');
  }
  if (emphasisAreas !== null) {
    const filterEmphasisAreas = emphasisAreas
      .map(({ field }) => `e.${field}`)
      .join(' OR ');
    filters.push(`(${filterEmphasisAreas})`);
  }
  if (hoursOfDay !== null) {
    const [hourStart, hourEnd] = hoursOfDay;
    params.hourStart = hourStart;
    params.hourEnd = hourEnd;
    filters.push('date_part(\'HOUR\', e.accdate) BETWEEN $(hourStart) AND $(hourEnd)');
  }
  if (roadSurfaceConditions !== null) {
    params.roadSurfaceConditions = roadSurfaceConditions.map(({ code }) => code);
    filters.push('e.rdsfcond IN ($(roadSurfaceConditions:csv))');
  }
  return { filters, params };
}

/**
 * Data access layer for collisions.  Each collision record consists of a collision event and
 * zero or more involved persons.
 */
class CollisionDAO {
  static async byCollisionId(id) {
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

  /**
   *
   * @param {CentrelineType} centrelineType - type of centreline feature
   * @param {number} centrelineId - ID of centreline feature
   */
  static async byCentreline(
    centrelineType,
    centrelineId,
    dateRange,
    daysOfWeek,
    emphasisAreas,
    hoursOfDay,
    roadSurfaceConditions,
  ) {
    const { filters, params } = getCollisionFilters(
      centrelineType,
      centrelineId,
      dateRange,
      daysOfWeek,
      emphasisAreas,
      hoursOfDay,
      roadSurfaceConditions,
    );
    const sqlFilters = filters.join('\n  AND ');
    const sqlEvents = `
SELECT e.*
FROM collisions.events e
JOIN collisions.events_centreline ec ON e.collision_id = ec.collision_id
WHERE ${sqlFilters}
ORDER BY e.collision_id`;
    const sqlInvolved = `
SELECT i.*
FROM collisions.involved i
JOIN collisions.events_centreline ec ON i.collision_id = ec.collision_id
WHERE ${sqlFilters}
ORDER BY i.collision_id`;
    const [rowsEvents, rowsInvolved] = await Promise.all([
      db.manyOrNone(sqlEvents, params),
      db.manyOrNone(sqlInvolved, params),
    ]);
    const events = rowsEvents.map(row => ({
      ...normalizeEvent(row),
      involved: [],
    }));
    let i = 0;
    rowsInvolved.forEach((row) => {
      const { collision_id: collisionId } = row;
      while (events[i].collisionId < collisionId) {
        i += 1;
      }
      if (events[i].collisionId === collisionId) {
        const involved = normalizeInvolved(row);
        events[i].involved.push(involved);
      }
    });
    return events;
  }

  static async byCentrelineTotal(centrelineType, centrelineId) {
    const params = { centrelineId, centrelineType };
    const sql = `
SELECT COUNT(*) AS total
FROM collisions.events_centreline
WHERE centreline_type = $(centrelineType)
AND centreline_id = $(centrelineId)`;
    const { total } = await db.one(sql, params);
    return total;
  }

  static async byCentrelineSummary(
    centrelineType,
    centrelineId,
    dateRange,
    /*
    daysOfWeek,
    emphasisAreas,
    hoursOfDay,
    roadSurfaceConditions,
    */
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
WITH collisions_involved_summary AS (
  SELECT
    i.collision_id,
    MAX(CONCAT('0', i.injury)::int) AS injury
  FROM collisions.events e
  JOIN collisions.involved i ON e.collision_id = i.collision_id
  JOIN collisions.events_centreline ec ON e.collision_id = ec.collision_id
  WHERE ${sqlFilters}
  GROUP BY i.collision_id
), collisions AS (
  SELECT cis.*, e.changed
  FROM collisions_involved_summary cis
  JOIN collisions.events e USING (collision_id)
)
SELECT
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE injury >= 3) AS ksi,
  COUNT(*) FILTER (WHERE changed IS NOT NULL) AS validated
FROM collisions`;
    return db.one(sql, params);
  }
}

export default CollisionDAO;
