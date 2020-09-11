BEGIN;

ALTER TABLE "study_requests" DROP COLUMN "studyRequestBulkId";

DROP TABLE "study_requests_bulk";

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 15;
COMMIT;
