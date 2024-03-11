import { centrelineKey } from '@/lib/Constants';
import db from '@/lib/db/db';
import {
  getCentrelineFilter,
  getCollisionFilters,
} from '@/lib/db/filters/CollisionFiltersSql';
import CollisionEvent from '@/lib/model/CollisionEvent';
import Joi from '@/lib/model/Joi';
import { normalizeCollisionEvent } from '@/lib/model/helpers/NormalizeUtils';

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
  e.city_damage AS "cityDamage",
  e.cyclist,
  e.injury,
  e.ksi,
  e.motorcyclist,
  e.older_adult AS "olderAdult",
  e.pedestrian,
  e.red_light AS "redLight",
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
  i.city_damage AS "cityDamage",
  i.cyclist,
  i.ksi,
  i.motorcyclist,
  i.older_adult AS "olderAdult",
  i.pedestrian,
  i.red_light AS "redLight",
  i.school_child AS "schoolChild",
  i.speeding
  FROM collisions.involved i`;

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

  // sorting collisionEvents in descending order by date
  collisionEvents.sort((a, b) => b.accdate - a.accdate);

  const collisionEventsSchema = Joi.array().items(CollisionEvent.read);
  return collisionEventsSchema.validateAsync(collisionEvents);
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

  static async byCollisionIds(collisionIds) {
    if (collisionIds.length === 0) {
      return [];
    }

    const sqlEvents = `
SELECT ${COLLISION_EVENTS_FIELDS}
WHERE e.collision_id IN ($(collisionIds:csv))
ORDER BY e.collision_id`;
    const sqlInvolved = `
SELECT ${COLLISION_INVOLVED_FIELDS}
WHERE i.collision_id IN ($(collisionIds:csv))
ORDER BY i.collision_id`;
    const [events, involved] = await Promise.all([
      db.manyOrNone(sqlEvents, { collisionIds }),
      db.manyOrNone(sqlInvolved, { collisionIds }),
    ]);
    return validateCollisions(events, involved);
  }

  static async byCentreline(features, collisionQuery) {
    const { filters, params } = getCollisionFilters(features, collisionQuery);
    const collisionFilters = filters.join('\n  AND ');

    const sqlCollisionIds = `
SELECT DISTINCT(e.collision_id) AS "collisionId"
FROM collisions.events e
JOIN collisions.involved i ON e.collision_id = i.collision_id
JOIN collisions.events_centreline ec ON e.collision_id = ec.collision_id
WHERE ${collisionFilters}`;
    const rows = await db.manyOrNone(sqlCollisionIds, params);
    const collisionIds = rows.map(({ collisionId }) => collisionId);

    return CollisionDAO.byCollisionIds(collisionIds);
  }

  static async byCentrelineSummary(features, collisionQuery) {
    const { filters, params } = getCollisionFilters(features, collisionQuery);
    const collisionFilters = filters.join('\n  AND ');

    const sqlCollisionIds = `
SELECT DISTINCT(e.collision_id) AS "collisionId"
FROM collisions.events e
JOIN collisions.involved i ON e.collision_id = i.collision_id
JOIN collisions.events_centreline ec ON e.collision_id = ec.collision_id
WHERE ${collisionFilters}`;
    const rows = await db.manyOrNone(sqlCollisionIds, params);
    const collisionIds = rows.map(({ collisionId }) => collisionId);

    if (collisionIds.length === 0) {
      return { amount: 0, ksi: 0, validated: 0 };
    }

    const sqlSummary = `
SELECT
  COUNT(*) AS amount,
  COUNT(*) FILTER (WHERE e.ksi) AS ksi,
  COUNT(*) FILTER (WHERE e.changed = -1) AS validated
FROM collisions.events e
JOIN collisions.events_centreline ec ON e.collision_id = ec.collision_id
WHERE e.collision_id IN ($(collisionIds:csv))`;
    return db.one(sqlSummary, { collisionIds });
  }

  static async byCentrelineSummaryPerLocation(features, collisionQuery) {
    const { filters, params } = getCollisionFilters(features, collisionQuery);
    const collisionFilters = filters.join('\n  AND ');

    const sqlCollisionIds = `
SELECT DISTINCT(e.collision_id) AS "collisionId"
FROM collisions.events e
JOIN collisions.involved i ON e.collision_id = i.collision_id
JOIN collisions.events_centreline ec ON e.collision_id = ec.collision_id
WHERE ${collisionFilters}`;
    const rowsCollisionIds = await db.manyOrNone(sqlCollisionIds, params);
    const collisionIds = rowsCollisionIds.map(({ collisionId }) => collisionId);

    let rowsSummaryPerLocation = [];
    if (collisionIds.length > 0) {
      const sqlSummaryPerLocation = `
  SELECT
    ec.centreline_type AS "centrelineType",
    ec.centreline_id AS "centrelineId",
    COUNT(*) AS amount,
    COUNT(*) FILTER (WHERE e.ksi) AS ksi,
    COUNT(*) FILTER (WHERE e.changed = -1) AS validated
  FROM collisions.events e
  JOIN collisions.events_centreline ec ON e.collision_id = ec.collision_id
  WHERE e.collision_id IN ($(collisionIds:csv))
  GROUP BY ec.centreline_type, ec.centreline_id`;
      rowsSummaryPerLocation = await db.manyOrNone(sqlSummaryPerLocation, { collisionIds });
    }

    const mapSummaryPerLocation = new Map(
      rowsSummaryPerLocation.map(({ centrelineId, centrelineType, ...summary }) => {
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
