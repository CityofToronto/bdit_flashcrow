CREATE SCHEMA IF NOT EXISTS counts_new;

CREATE TABLE IF NOT EXISTS counts_new.arteries_midblock_manual_corr (
  arterycode BIGINT NOT NULL,
  geo_id BIGINT,
  direction CHAR(1)
);
CREATE UNIQUE INDEX IF NOT EXISTS arteries_midblock_manual_corr_arterycode ON counts_new.arteries_midblock_manual_corr (arterycode);

TRUNCATE TABLE counts_new.arteries_midblock_manual_corr;
