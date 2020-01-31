BEGIN;

ALTER TABLE "study_requests" DROP COLUMN "urgentReason";

ALTER TABLE "study_requests" ADD COLUMN "priority" VARCHAR NOT NULL DEFAULT 'STANDARD';
UPDATE "study_requests" SET "priority" = 'URGENT' WHERE "urgent";
ALTER TABLE "study_requests" DROP COLUMN "urgent";

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 7;
COMMIT;
