import { centrelineKey } from '@/lib/Constants';
import { formatCombinedStreet } from '@/lib/StringFormatters';
import db from '@/lib/db/db';
import { InvalidCollisionQueryError } from '@/lib/error/MoveErrors';
import CollisionEvent from '@/lib/model/CollisionEvent';
import Joi from '@/lib/model/Joi';

const COLLISION_EVENTS_FIELDS = `
  e.collision_id AS "collisionId",
  e.accnb,
  e.accdate,
  e.stname1, e.streetype1, e.dir1,
  e.stname2, e.streetype2, e.dir2,
  e.stname3, e.streetype3, e.dir3,
  e.municipal,
  e.acclass,
  e.accloc,
  e.traffictl,
  e.impactype,
  e.visible,
  e.light,
  e.rdsfcond,
  e.changed,
  e.private_property AS "privateProperty",
  e.road_class AS "roadClass",
  e.mvaimg,
  e.description,
  e.trafctlcond,
  ST_AsGeoJSON(e.geom)::json AS geom,
  ec.centreline_id AS "centrelineId",
  ec.centreline_type AS "centrelineType",
  e.aggressive,
  e.cyclist,
  e.ksi,
  e.motorcyclist,
  e.older_adult AS "olderAdult",
  e.pedestrian,
  e.property_damage AS "propertyDamage",
  e.school_child AS "schoolChild",
  e.speeding
  FROM collisions.events e
  JOIN collisions.events_centreline ec ON e.collision_id = ec.collision_id`;

const COLLISION_INVOLVED_FIELDS = `
  i.id,
  i.collision_id AS "collisionId",
  i.veh_no AS "vehNo",
  i.vehtype,
  i.initdir,
  i.imploc,
  i.per_no AS "perNo",
  i.invtype,
  i.invage,
  i.injury,
  i.safequip,
  i.drivact,
  i.drivcond,
  i.pedcond,
  i.pedact,
  i.manoeuver,
  i.failtorem,
  i.pedtype,
  i.cyclistype,
  i.cycact,
  i.cyccond,
  i.fatal_no AS "fatalNo",
  i.actual_speed AS "actualSpeed",
  i.posted_speed AS "postedSpeed",
  i.aggressive,
  i.cyclist,
  i.ksi,
  i.motorcyclist,
  i.older_adult AS "olderAdult",
  i.pedestrian,
  i.property_damage AS "propertyDamage",
  i.school_child AS "schoolChild",
  i.speeding
  FROM collisions.involved i`;

function normalizeCollisionQuery(collisionQuery) {
  const {
    dateRangeEnd,
    dateRangeStart,
    hoursOfDayEnd,
    hoursOfDayStart,
    ...collisionQueryRest
  } = collisionQuery;
  let dateRange = null;
  if (dateRangeStart !== undefined && dateRangeEnd !== undefined) {
    if (dateRangeStart.valueOf() > dateRangeEnd.valueOf()) {
      throw new InvalidCollisionQueryError('invalid date range: start is after end');
    }
    dateRange = { start: dateRangeStart, end: dateRangeEnd };
  }
  let hoursOfDay = null;
  if (hoursOfDayStart !== undefined && hoursOfDayEnd !== undefined) {
    if (hoursOfDayStart > hoursOfDayEnd) {
      throw new InvalidCollisionQueryError('invalid hours of day: start is after end');
    }
    hoursOfDay = [hoursOfDayStart, hoursOfDayEnd];
  }
  return {
    ...collisionQueryRest,
    dateRange,
    hoursOfDay,
  };
}

function normalizeCollisionEvent(event) {
  const {
    stname1,
    streetype1,
    dir1,
    stname2,
    streetype2,
    dir2,
    stname3,
    streetype3,
    dir3,
    ...eventRest
  } = event;
  const street1 = formatCombinedStreet(stname1, streetype1, dir1);
  const street2 = formatCombinedStreet(stname2, streetype2, dir2);
  const street3 = formatCombinedStreet(stname3, streetype3, dir3);

  return {
    ...eventRest,
    street1,
    street2,
    street3,
  };
}

async function validateCollision(event, involved) {
  const collisionEvent = normalizeCollisionEvent(event);
  collisionEvent.involved = involved;
  return CollisionEvent.read.validateAsync(collisionEvent);
}

async function validateCollisions(events, involved) {
  const collisionEvents = events.map(event => ({
    ...normalizeCollisionEvent(event),
    involved: [],
  }));
  let i = 0;
  involved.forEach((row) => {
    const { collisionId } = row;
    while (collisionEvents[i].collisionId < collisionId) {
      i += 1;
    }
    if (collisionEvents[i].collisionId === collisionId) {
      collisionEvents[i].involved.push(row);
    }
  });
  const collisionEventsSchema = Joi.array().items(CollisionEvent.read);
  return collisionEventsSchema.validateAsync(collisionEvents);
}

function getCentrelineFilter(features) {
  const featureIds = features.map(
    ({ centrelineId, centrelineType }) => `(${centrelineType}, ${centrelineId})`,
  );
  const featureIdsStr = featureIds.join(', ');
  return `(ec.centreline_type, ec.centreline_id) IN (${featureIdsStr})`;
}

function getCollisionFilters(features, collisionQuery) {
  const centrelineFilter = getCentrelineFilter(features);
  const filters = [centrelineFilter];
  const params = {};
  const {
    dateRange,
    daysOfWeek,
    emphasisAreas,
    hoursOfDay,
    roadSurfaceConditions,
  } = collisionQuery;
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
    params.hourEnd = hourEnd - 1;
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
  static async byCollisionId(collisionId) {
    const sqlEvent = `SELECT ${COLLISION_EVENTS_FIELDS} WHERE e.collision_id = $(collisionId)`;
    const sqlInvolved = `SELECT ${COLLISION_INVOLVED_FIELDS} WHERE i.collision_id = $(collisionId)`;
    const [event, involved] = await Promise.all([
      db.oneOrNone(sqlEvent, { collisionId }),
      db.manyOrNone(sqlInvolved, { collisionId }),
    ]);
    if (event === null) {
      return null;
    }
    return validateCollision(event, involved);
  }

  static async byCentreline(features, collisionQuery) {
    const collisionQueryNormalized = normalizeCollisionQuery(collisionQuery);
    const { filters, params } = getCollisionFilters(features, collisionQueryNormalized);
    const collisionFilters = filters.join('\n  AND ');
    const sqlEvents = `
SELECT ${COLLISION_EVENTS_FIELDS}
WHERE ${collisionFilters}
ORDER BY e.collision_id`;
    const sqlInvolved = `
SELECT ${COLLISION_INVOLVED_FIELDS}
JOIN collisions.events e ON i.collision_id = e.collision_id
JOIN collisions.events_centreline ec ON i.collision_id = ec.collision_id
WHERE ${collisionFilters}
ORDER BY i.collision_id`;
    const [events, involved] = await Promise.all([
      db.manyOrNone(sqlEvents, params),
      db.manyOrNone(sqlInvolved, params),
    ]);
    return validateCollisions(events, involved);
  }

  static async byCentrelineSummary(features, collisionQuery) {
    const collisionQueryNormalized = normalizeCollisionQuery(collisionQuery);
    const { filters, params } = getCollisionFilters(features, collisionQueryNormalized);
    const collisionFilters = filters.join('\n  AND ');
    const sql = `
SELECT
  COUNT(*) AS amount,
  COUNT(*) FILTER (WHERE e.ksi) AS ksi,
  COUNT(*) FILTER (WHERE e.changed = -1) AS validated
FROM collisions.events e
JOIN collisions.events_centreline ec ON e.collision_id = ec.collision_id
WHERE ${collisionFilters}`;
    return db.one(sql, params);
  }

  static async byCentrelineSummaryPerLocation(features, collisionQuery) {
    const collisionQueryNormalized = normalizeCollisionQuery(collisionQuery);
    const { filters, params } = getCollisionFilters(features, collisionQueryNormalized);
    const collisionFilters = filters.join('\n  AND ');
    const sql = `
SELECT
  ec.centreline_type AS "centrelineType",
  ec.centreline_id AS "centrelineId",
  COUNT(*) AS amount,
  COUNT(*) FILTER (WHERE e.ksi) AS ksi,
  COUNT(*) FILTER (WHERE e.changed = -1) AS validated
FROM collisions.events e
JOIN collisions.events_centreline ec ON e.collision_id = ec.collision_id
WHERE ${collisionFilters}
GROUP BY ec.centreline_type, ec.centreline_id`;
    const rows = await db.manyOrNone(sql, params);
    const mapSummaryPerLocation = new Map(
      rows.map(({ centrelineId, centrelineType, ...summary }) => {
        const feature = { centrelineId, centrelineType };
        const key = centrelineKey(feature);
        return [key, summary];
      }),
    );
    return features.map((feature) => {
      const key = centrelineKey(feature);
      if (mapSummaryPerLocation.has(key)) {
        return mapSummaryPerLocation.get(key);
      }
      return { amount: 0, ksi: 0, validated: 0 };
    });
  }

  static async byCentrelineTotal(features) {
    const centrelineFilter = getCentrelineFilter(features);
    const sql = `
SELECT COUNT(*) AS total
FROM collisions.events_centreline ec
WHERE ${centrelineFilter}`;
    const { total } = await db.one(sql);
    return total;
  }
}

export default CollisionDAO;
