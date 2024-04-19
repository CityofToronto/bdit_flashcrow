import db from '@/lib/db/db';
import { InvalidDynamicTileLayerError } from '@/lib/error/MoveErrors';
import VectorTile from '@/lib/geo/VectorTile';
import { getExcludedStudiesFilter } from '@/lib/db/filters/StudyFiltersSql';

const EPSG_3857_MAX = 20037508.3427892;
const EPSG_3857_MIN = -EPSG_3857_MAX;
const EPSG_3857_SIZE = EPSG_3857_MAX - EPSG_3857_MIN;

class DynamicTileDAO {
  static getTileInfo(z, x, y) {
    const bmin = -VectorTile.BUFFER;
    const bmax = VectorTile.EXTENT + VectorTile.BUFFER;
    const tileSize = EPSG_3857_SIZE / Math.pow(2, z);
    const xmin = EPSG_3857_MIN + tileSize * x;
    const xmax = EPSG_3857_MIN + tileSize * (x + 1);
    const ymin = EPSG_3857_MAX - tileSize * (y + 1);
    const ymax = EPSG_3857_MAX - tileSize * y;
    const res = tileSize / VectorTile.EXTENT;
    const fx = 1 / res;
    const fy = -fx;
    const xoff = -xmin * fx;
    const yoff = -ymax * fy;

    return {
      bmin,
      bmax,
      xmin,
      ymin,
      xmax,
      ymax,
      res,
      fx,
      fy,
      xoff,
      yoff,
    };
  }

  static async getCollisionsFeatures(tileInfo, datesFrom) {
    const datesFromYear = `${datesFrom} year`;
    const sql = `
WITH event_involved AS (
  SELECT
    i.collision_id,
    concat('|', array_to_string(array_agg(i.drivact), '|'), '|') AS drivact,
    concat('|', array_to_string(array_agg(i.drivcond), '|'), '|') AS drivcond,
    concat('|', array_to_string(array_agg(i.initdir), '|'), '|') AS initdir,
    concat('|', array_to_string(array_agg(i.manoeuver), '|'), '|') AS manoeuver,
    concat('|', array_to_string(array_agg(i.vehtype), '|'), '|') AS vehtype
  FROM collisions.events e
  JOIN collisions.involved i ON e.collision_id = i.collision_id
  WHERE ST_Intersects(
    ST_Transform(e.geom, 3857),
    ST_MakeEnvelope($(xmin), $(ymin), $(xmax), $(ymax), 3857)
  ) AND e.accdate >= now() - interval $(datesFromYear)
  GROUP BY i.collision_id
),
collisions AS (
  SELECT
    e.id,
    e.geom,
    e.accdate,
    e.aggressive,
    ec.centreline_id,
    ec.centreline_type,
    e.changed,
    e.city_damage,
    ei.collision_id,
    e.cyclist,
    date_part('DOW', e.accdate) AS "dayOfWeek",
    ei.drivact,
    ei.drivcond,
    date_part('HOUR', e.accdate) AS "hourOfDay",
    e.impactype,
    ei.initdir,
    e.injury,
    ei.manoeuver,
    e.motorcyclist,
    e.mvaimg,
    e.older_adult,
    e.pedestrian,
    e.rdsfcond,
    e.red_light,
    e.school_child,
    ei.vehtype
  FROM event_involved ei
  JOIN collisions.events e ON ei.collision_id = e.collision_id
  JOIN collisions.events_centreline ec ON ei.collision_id = ec.collision_id
)
SELECT ST_AsGeoJSON(
  ST_SnapToGrid(
    ST_Affine(
      ST_Transform(geom, 3857),
      $(fx), 0,
      0, $(fy),
      $(xoff), $(yoff)
    ),
    0, 0, 1, 1
  )
)::json AS geom,
id,
accdate,
aggressive,
centreline_id AS "centrelineId",
centreline_type AS "centrelineType",
changed,
city_damage,
collision_id,
cyclist,
"dayOfWeek",
drivact,
drivcond,
"hourOfDay",
impactype,
initdir,
injury,
manoeuver,
motorcyclist,
mvaimg,
older_adult,
pedestrian,
rdsfcond,
red_light,
school_child,
vehtype
FROM collisions`;
    return db.manyOrNone(sql, {
      ...tileInfo,
      datesFromYear,
    });
  }

  static getHospitalsFeatures(tileInfo) {
    const sql = `
WITH hospitals AS (
  SELECT objectid, geom, stn_name, general_use_code
  FROM gis.hospital
  WHERE ST_Intersects(
    ST_Transform(geom, 3857),
    ST_MakeEnvelope($(xmin), $(ymin), $(xmax), $(ymax), 3857)
  )
)
SELECT ST_AsGeoJSON(
  ST_SnapToGrid(
    ST_Affine(
      ST_Transform(geom, 3857),
      $(fx), 0,
      0, $(fy),
      $(xoff), $(yoff)
    ),
    0, 0, 1, 1
  )
)::json AS geom,
objectid AS id,
stn_name AS "name",
general_use_code AS "hospitalType"
FROM hospitals`;
    return db.manyOrNone(sql, tileInfo);
  }

  static getSchoolsFeatures(tileInfo) {
    const sql = `
WITH schools AS (
  SELECT objectid, geom, name, school_type
  FROM gis.school
  WHERE ST_Intersects(
    ST_Transform(geom, 3857),
    ST_MakeEnvelope($(xmin), $(ymin), $(xmax), $(ymax), 3857)
  )
)
SELECT ST_AsGeoJSON(
  ST_SnapToGrid(
    ST_Affine(
      ST_Transform(geom, 3857),
      $(fx), 0,
      0, $(fy),
      $(xoff), $(yoff)
    ),
    0, 0, 1, 1
  )
)::json AS geom,
objectid AS id,
name,
school_type AS "schoolType"
FROM schools`;
    return db.manyOrNone(sql, tileInfo);
  }

  static async getStudiesFeatures(tileInfo) {
    const excludeFilter = getExcludedStudiesFilter();
    const sql = `
WITH studies AS (
  SELECT
    "centrelineId",
    "centrelineType",
    concat('|', array_to_string("daysOfWeek", '|'), '|') AS "daysOfWeek",
    "geom",
    "hours",
    "startDate",
    "studyType"
  FROM counts2.studies
  WHERE ST_Intersects(
    ST_Transform(geom, 3857),
    ST_MakeEnvelope($(xmin), $(ymin), $(xmax), $(ymax), 3857)
  )
  AND "centrelineId" IS NOT NULL AND "centrelineType" IS NOT NULL
  AND "studyType" NOT IN (${excludeFilter})
)
SELECT ST_AsGeoJSON(
  ST_SnapToGrid(
    ST_Affine(
      ST_Transform(geom, 3857),
      $(fx), 0,
      0, $(fy),
      $(xoff), $(yoff)
    ),
    0, 0, 1, 1
  )
)::json AS geom,
"centrelineType" * 1000000000 + "centrelineId" AS id,
"centrelineId",
"centrelineType",
"daysOfWeek",
"hours",
"startDate",
"studyType"
FROM studies`;
    return db.manyOrNone(sql, tileInfo);
  }

  static async getTileFeatures(layerName, z, x, y) {
    const tileInfo = DynamicTileDAO.getTileInfo(z, x, y);
    if (layerName.startsWith('collisionsLevel1')) {
      return DynamicTileDAO.getCollisionsFeatures(tileInfo, 10);
    }
    if (layerName === 'hospitalsLevel1') {
      return DynamicTileDAO.getHospitalsFeatures(tileInfo);
    }
    if (layerName === 'schoolsLevel1') {
      return DynamicTileDAO.getSchoolsFeatures(tileInfo);
    }
    if (layerName === 'studies') {
      return DynamicTileDAO.getStudiesFeatures(tileInfo);
    }
    throw new InvalidDynamicTileLayerError(layerName);
  }
}
DynamicTileDAO.EPSG_3857_MAX = EPSG_3857_MAX;
DynamicTileDAO.EPSG_3857_MIN = EPSG_3857_MIN;
DynamicTileDAO.EPSG_3857_SIZE = EPSG_3857_SIZE;

export default DynamicTileDAO;
