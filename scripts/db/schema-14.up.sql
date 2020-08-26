BEGIN;

ALTER TABLE "job_metadata" ADD COLUMN "description" VARCHAR NOT NULL;

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 14;
COMMIT;
