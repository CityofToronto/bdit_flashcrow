BEGIN;

DROP TABLE "job_metadata" CASCADE;
DROP TABLE "job_users" CASCADE;

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 12;
COMMIT;
