BEGIN;

ALTER TABLE "study_requests" ADD COLUMN "urgent" BOOLEAN NOT NULL DEFAULT FALSE;
UPDATE "study_requests" SET "urgent" = TRUE WHERE "priority" = 'URGENT';
ALTER TABLE "study_requests" DROP COLUMN "priority";

ALTER TABLE "study_requests" ADD COLUMN "urgentReason" VARCHAR;

DROP TABLE "study_request_reasons";

ALTER TABLE "study_requests" DROP CONSTRAINT "study_requests_status_fkey";
DROP TABLE "study_request_status";

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 8;
COMMIT;
