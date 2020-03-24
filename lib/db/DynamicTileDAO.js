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

  static async getCollisionsFeatures(tileInfo) {
    const sql = `
WITH event_injury AS (
  SELECT i.collision_id, MAX(CONCAT('0', i.injury)::int) AS injury
  FROM collisions.events e
  JOIN collisions.involved i ON e.collision_id = i.collision_id
  WHERE ST_Intersects(
    ST_Transform(e.geom, 3857),
    ST_MakeEnvelope($(xmin), $(ymin), $(xmax), $(ymax), 3857)
  ) AND e.accdate >= now() - interval '1 year'
  GROUP BY i.collision_id
),
collisions AS (
  SELECT
    ei.collision_id, ei.injury,
    e.geom, e.accnb, e.accdate, e.acctime,
    ec.centreline_id, ec.centreline_type
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
collision_id AS id,
accnb,
accdate,
acctime,
centreline_id AS "centrelineId",
centreline_type AS "centrelineType",
injury
FROM collisions`;
    return db.manyOrNone(sql, tileInfo);
  }

  static async getCountsFeatures(tileInfo) {
    const sql = `
WITH counts AS ((
  SELECT ac.centreline_id, ac.centreline_type, ac.geom,
  COUNT(DISTINCT(ci."ARTERYCODE")) AS "numArteryCodes"
  FROM "TRAFFIC"."COUNTINFO" ci
  JOIN prj_volume.artery_centreline ac ON ci."ARTERYCODE" = ac.arterycode
  WHERE ST_Intersects(
    ST_Transform(ac.geom, 3857),
    ST_MakeEnvelope($(xmin), $(ymin), $(xmax), $(ymax), 3857)
  )
  GROUP BY ac.centreline_id, ac.centreline_type, ac.geom
) UNION ALL (
  SELECT ac.centreline_id, ac.centreline_type, ac.geom,
  COUNT(DISTINCT(cim."ARTERYCODE")) AS "numArteryCodes"
  FROM "TRAFFIC"."COUNTINFOMICS" cim
  JOIN prj_volume.artery_centreline ac ON cim."ARTERYCODE" = ac.arterycode
  WHERE ST_Intersects(
    ST_Transform(ac.geom, 3857),
    ST_MakeEnvelope($(xmin), $(ymin), $(xmax), $(ymax), 3857)
  )
  GROUP BY ac.centreline_id, ac.centreline_type, ac.geom
))
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
"numArteryCodes"
FROM counts`;
    return db.manyOrNone(sql, tileInfo);
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

  static async getTileFeatures(layerName, z, x, y) {
    const tileInfo = DynamicTileDAO.getTileInfo(z, x, y);
    if (layerName === 'collisionsLevel1') {
      return DynamicTileDAO.getCollisionsFeatures(tileInfo);
    }
    if (layerName === 'counts') {
      return DynamicTileDAO.getCountsFeatures(tileInfo);
    }
    if (layerName === 'hospitalsLevel1') {
      return DynamicTileDAO.getHospitalsFeatures(tileInfo);
    }
    if (layerName === 'schoolsLevel1') {
      return DynamicTileDAO.getSchoolsFeatures(tileInfo);
    }
    throw new InvalidDynamicTileLayerError(layerName);
  }
}

export default DynamicTileDAO;
