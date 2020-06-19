CREATE SCHEMA IF NOT EXISTS volume;
CREATE SCHEMA IF NOT EXISTS volume_new;

CREATE TABLE IF NOT EXISTS volume_new.aadt_raw (
  centreline_id BIGINT NOT NULL,
  dir_bin INTEGER NOT NULL,
  aadt REAL NOT NULL
);

TRUNCATE TABLE volume_new.aadt_raw;
