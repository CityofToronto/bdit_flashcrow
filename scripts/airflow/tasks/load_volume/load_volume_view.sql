CREATE MATERIALIZED VIEW IF NOT EXISTS "prj_volume"."aadt" AS
  SELECT "centreline_id", SUM("aadt") AS "aadt"
  FROM "prj_volume_new"."aadt_raw"
  GROUP BY "centreline_id";

CREATE UNIQUE INDEX IF NOT EXISTS aadt_centreline_id
  ON "prj_volume"."aadt" ("centreline_id");

REFRESH MATERIALIZED VIEW CONCURRENTLY "prj_volume"."aadt";
