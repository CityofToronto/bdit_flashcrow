CREATE SCHEMA IF NOT EXISTS counts;

CREATE MATERIALIZED VIEW IF NOT EXISTS counts.arteries_midblock_geo_id AS (
  SELECT amii.arterycode, c.geo_id
  FROM counts.arteries_midblock_int_id amii
  JOIN counts.centreline c ON (
    (amii.from_int_id = c.from_int_id AND amii.to_int_id = c.to_int_id)
    OR (amii.from_int_id = c.to_int_id AND amii.to_int_id = c.from_int_id)
  )
  WHERE amii.n = 2
);
CREATE UNIQUE INDEX IF NOT EXISTS arteries_midblock_geo_id_arterycode_geo_id ON counts.arteries_midblock_geo_id (arterycode, geo_id);

REFRESH MATERIALIZED VIEW CONCURRENTLY counts.arteries_midblock_geo_id;

CREATE MATERIALIZED VIEW IF NOT EXISTS counts.arteries_midblock_geo_id_single AS (
  WITH geo_id_counts AS (
    SELECT arterycode, count(*) AS n
    FROM counts.arteries_midblock_geo_id
    GROUP BY arterycode
  )
  SELECT amgi.arterycode, amgi.geo_id
  FROM counts.arteries_midblock_geo_id amgi
  JOIN geo_id_counts gic USING (arterycode)
  WHERE gic.n = 1
);
CREATE UNIQUE INDEX IF NOT EXISTS arteries_midblock_geo_id_single_arterycode ON counts.arteries_midblock_geo_id_single (arterycode);

-- TODO: ranked multiple
