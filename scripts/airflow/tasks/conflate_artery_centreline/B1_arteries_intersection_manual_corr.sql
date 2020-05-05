CREATE SCHEMA IF NOT EXISTS counts;

-- TODO: figure out how / whether to handle intersection corrections here
CREATE MATERIALIZED VIEW IF NOT EXISTS counts.arteries_intersection_manual_corr AS (
  SELECT arterycode, centreline_id AS int_id
  FROM counts.arteries_manual_corr
  WHERE FALSE
);
CREATE UNIQUE INDEX IF NOT EXISTS arteries_intersection_manual_corr_arterycode ON counts.arteries_intersection_manual_corr (arterycode);

REFRESH MATERIALIZED VIEW CONCURRENTLY counts.arteries_intersection_manual_corr;
