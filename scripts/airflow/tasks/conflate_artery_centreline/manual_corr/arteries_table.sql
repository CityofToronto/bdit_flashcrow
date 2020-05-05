CREATE SCHEMA IF NOT EXISTS counts_new;

CREATE TABLE IF NOT EXISTS counts_new.arteries_manual_corr (
  arterycode BIGINT NOT NULL,
  direction TEXT,
  sideofint CHAR(1),
  centreline_id BIGINT NOT NULL,
  artery_type SMALLINT NOT NULL,
  match_on_case SMALLINT,
  was_match_on_case SMALLINT
);

TRUNCATE TABLE counts_new.arteries_manual_corr;
