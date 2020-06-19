CREATE MATERIALIZED VIEW IF NOT EXISTS volume.aadt AS
  SELECT centreline_id, SUM(aadt) AS aadt
  FROM volume_new.aadt_raw
  GROUP BY centreline_id;

CREATE UNIQUE INDEX IF NOT EXISTS aadt_centreline_id
  ON volume.aadt (centreline_id);

REFRESH MATERIALIZED VIEW CONCURRENTLY volume.aadt;
