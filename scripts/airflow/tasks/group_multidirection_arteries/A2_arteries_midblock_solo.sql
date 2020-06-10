CREATE SCHEMA IF NOT EXISTS counts;

CREATE MATERIALIZED VIEW IF NOT EXISTS counts.arteries_midblock_solo AS (
  WITH a AS (
    SELECT geo_id
    FROM (
      SELECT geo_id, COUNT(*) as n
      FROM counts.arteries_midblock WHERE geo_id IS NOT NULL
      GROUP BY geo_id
    ) t
    WHERE n = 1
  )
  SELECT am.arterycode, am.geo_id, am.geom
  FROM a
  JOIN counts.arteries_midblock am USING (geo_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS arteries_midblock_solo_arterycode1 ON counts.arteries_midblock_solo (arterycode);

REFRESH MATERIALIZED VIEW CONCURRENTLY counts.arteries_midblock_solo;
