BEGIN;

ALTER TABLE "study_requests" DROP COLUMN "closed";

DROP TABLE "study_request_comments";

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 5;
COMMIT;
