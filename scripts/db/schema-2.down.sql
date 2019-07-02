BEGIN;
DROP TABLE "study_request_items" CASCADE;
DROP TABLE "study_requests" CASCADE;
UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 1;
COMMIT;
