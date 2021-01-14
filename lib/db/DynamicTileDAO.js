import db from '@/lib/db/db';
import { InvalidDynamicTileLayerError } from '@/lib/error/MoveErrors';
import VectorTile from '@/lib/geo/VectorTile';

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
WITH event_injury AS (
  SELECT i.collision_id, max(i.injury) AS injury
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
    ec.centreline_id,
    ec.centreline_type,
    ei.collision_id,
    ei.injury
  FROM event_injury ei
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
centreline_id AS "centrelineId",
centreline_type AS "centrelineType",
collision_id AS "collisionId",
injury
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
    const sql = `
WITH studies AS (
  SELECT
    centreline_id,
    centreline_type,
    ST_Centroid(ST_Collect(geom)) AS geom,
    MAX(start_date) AS "mostRecent",
    COUNT(DISTINCT(artery_group_id)) AS "numArteryCodes"
  FROM counts.studies
  WHERE ST_Intersects(
    ST_Transform(geom, 3857),
    ST_MakeEnvelope($(xmin), $(ymin), $(xmax), $(ymax), 3857)
  )
  AND centreline_id IS NOT NULL AND centreline_type IS NOT NULL
  GROUP BY centreline_id, centreline_type
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
centreline_type * 1000000000 + centreline_id AS id,
centreline_id AS "centrelineId",
centreline_type AS "centrelineType",
"mostRecent",
"numArteryCodes"
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
