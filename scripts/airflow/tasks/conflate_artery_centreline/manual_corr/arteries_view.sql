CREATE SCHEMA IF NOT EXISTS counts;

CREATE MATERIALIZED VIEW IF NOT EXISTS counts.arteries_manual_corr AS
  SELECT * FROM counts_new.arteries_manual_corr;


CREATE UNIQUE INDEX IF NOT EXISTS arteries_manual_corr_arterycode_direction_sideofint ON counts.arteries_manual_corr (arterycode, direction, sideofint);

REFRESH MATERIALIZED VIEW CONCURRENTLY counts.arteries_manual_corr;
