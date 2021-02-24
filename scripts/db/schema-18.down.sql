BEGIN;

ALTER TABLE study_requests DROP COLUMN "studyTypeOther";

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 17;
COMMIT;
