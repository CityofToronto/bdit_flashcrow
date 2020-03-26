CREATE SCHEMA IF NOT EXISTS "prj_volume";
CREATE SCHEMA IF NOT EXISTS "prj_volume_new";

CREATE TABLE IF NOT EXISTS "prj_volume_new"."aadt_raw" (
  "centreline_id" BIGINT NOT NULL,
  "dir_bin" INTEGER NOT NULL,
  "aadt" REAL NOT NULL
);

TRUNCATE TABLE "prj_volume_new"."aadt_raw";
