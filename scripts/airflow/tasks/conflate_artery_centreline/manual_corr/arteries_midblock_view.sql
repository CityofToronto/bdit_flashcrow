CREATE SCHEMA IF NOT EXISTS counts;

CREATE MATERIALIZED VIEW IF NOT EXISTS counts.arteries_midblock_manual_corr AS
  SELECT * FROM counts_new.arteries_midblock_manual_corr;

CREATE UNIQUE INDEX IF NOT EXISTS arteries_midblock_manual_corr_arterycode ON counts.arteries_midblock_manual_corr (arterycode);

REFRESH MATERIALIZED VIEW CONCURRENTLY counts.arteries_midblock_manual_corr;
