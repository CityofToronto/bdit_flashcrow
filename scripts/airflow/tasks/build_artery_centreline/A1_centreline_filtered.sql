CREATE SCHEMA IF NOT EXISTS prj_volume_tmp;

CREATE MATERIALIZED VIEW IF NOT EXISTS prj_volume_tmp.centreline AS (
  SELECT
    geo_id::bigint AS geo_id,
    fnode::bigint AS from_int_id,
    tnode::bigint AS to_int_id,
    geom
  FROM gis.centreline
  WHERE fcode < 202000
);
CREATE UNIQUE INDEX IF NOT EXISTS pvt_centreline_geo_id ON prj_volume_tmp.centreline (geo_id);
CREATE INDEX IF NOT EXISTS pvt_centreline_from_int_id ON prj_volume_tmp.centreline (from_int_id);
CREATE INDEX IF NOT EXISTS pvt_centreline_to_int_id ON prj_volume_tmp.centreline (to_int_id);

REFRESH MATERIALIZED VIEW CONCURRENTLY prj_volume_tmp.centreline;

CREATE MATERIALIZED VIEW IF NOT EXISTS prj_volume_tmp.centreline_intersection AS (
  SELECT
    int_id::bigint AS int_id,
    MODE() WITHIN GROUP(ORDER BY geom) AS geom
  FROM gis.centreline_intersection
  WHERE
    (intersec5 NOT LIKE '% Trl /% Trl%' OR intersec5 LIKE '%/%/%')
    AND intersec5 NOT LIKE '% Trl /% Trl /% Trl%'
  GROUP BY int_id
);
CREATE UNIQUE INDEX IF NOT EXISTS pvt_centreline_intersection_int_id ON prj_volume_tmp.centreline_intersection (int_id);
CREATE INDEX IF NOT EXISTS pvt_centreline_intersection_srid2952_geom ON prj_volume_tmp.centreline_intersection USING gist (ST_Transform(geom, 2952));

REFRESH MATERIALIZED VIEW CONCURRENTLY prj_volume_tmp.centreline_intersection;
