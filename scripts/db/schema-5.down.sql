BEGIN;

ALTER TABLE "study_requests" DROP COLUMN "assignedTo";

DROP TABLE "study_request_assignees";

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 4;
COMMIT;
