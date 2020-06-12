CREATE SCHEMA IF NOT EXISTS counts;

CREATE MATERIALIZED VIEW IF NOT EXISTS counts.arteries_centreline AS (
  SELECT
    arterycode,
    1 AS centreline_type,
    geo_id AS centreline_id,
    ad."APPRDIR"::CHAR(1) AS direction,
    geom
  FROM counts.arteries_midblock am
  JOIN "TRAFFIC"."ARTERYDATA" ad ON am.arterycode = ad."ARTERYCODE"
  WHERE am.geo_id IS NOT NULL
UNION ALL
  SELECT
    arterycode,
    2 AS centreline_type,
    int_id AS centreline_id,
    NULL::CHAR(1) AS direction,
    geom
  FROM counts.arteries_intersection
  WHERE int_id IS NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS arteries_centreline_arterycode ON counts.arteries_centreline (arterycode);
CREATE INDEX IF NOT EXISTS arteries_centreline_centreline ON counts.arteries_centreline (centreline_type, centreline_id);
CREATE INDEX IF NOT EXISTS arteries_centreline_geom ON counts.arteries_centreline using gist (geom);
CREATE INDEX IF NOT EXISTS arteries_centreline_srid3857_geom ON counts.arteries_centreline using gist (ST_Transform(geom, 3857));
CREATE INDEX IF NOT EXISTS arteries_centreline_srid2952_geom ON counts.arteries_centreline using gist (ST_Transform(geom, 2952));

REFRESH MATERIALIZED VIEW CONCURRENTLY counts.arteries_centreline;
