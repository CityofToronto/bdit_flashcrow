CREATE SCHEMA IF NOT EXISTS counts;

CREATE MATERIALIZED VIEW IF NOT EXISTS counts.arteries_midblock_direction AS (
  SELECT
    am.arterycode,
    am.geo_id,
    ad."APPRDIR"::CHAR(1) AS direction,
    am.geom
  FROM counts.arteries_midblock am
  JOIN "TRAFFIC"."ARTERYDATA" ad ON am.arterycode = ad."ARTERYCODE"
  WHERE geo_id IS NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS arteries_midblock_direction_arterycode ON counts.arteries_midblock_direction (arterycode);

REFRESH MATERIALIZED VIEW CONCURRENTLY counts.arteries_midblock_direction;
