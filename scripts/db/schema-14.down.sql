BEGIN;

ALTER TABLE "job_metadata" DROP COLUMN "description";

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 13;
COMMIT;
