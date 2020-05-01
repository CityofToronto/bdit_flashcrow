CREATE SCHEMA IF NOT EXISTS counts_new;

CREATE TABLE IF NOT EXISTS counts_new.arteries_intersection_manual_corr (
  arterycode BIGINT NOT NULL,
  int_id BIGINT
);
CREATE UNIQUE INDEX IF NOT EXISTS arteries_intersection_manual_corr_arterycode ON counts_new.arteries_intersection_manual_corr (arterycode);

TRUNCATE TABLE counts_new.arteries_intersection_manual_corr;
