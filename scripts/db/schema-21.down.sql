BEGIN;

ALTER TABLE study_request_items
DROP COLUMN urgent;

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 20;
COMMIT;
