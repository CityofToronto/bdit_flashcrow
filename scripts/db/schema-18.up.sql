BEGIN;

ALTER TABLE study_requests ADD COLUMN "studyTypeOther" VARCHAR;

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 18;
COMMIT;
