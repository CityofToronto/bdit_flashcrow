BEGIN;

DROP TABLE "study_request_changes";

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 11;
COMMIT;
