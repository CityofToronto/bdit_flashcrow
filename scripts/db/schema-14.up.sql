BEGIN;

TRUNCATE TABLE "job_metadata";
ALTER TABLE "job_metadata" ADD COLUMN "description" VARCHAR NOT NULL;
ALTER TABLE "job_metadata" ADD COLUMN "metadata" JSONB NOT NULL;

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 14;
COMMIT;
