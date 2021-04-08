BEGIN;

DROP TABLE study_request_items;

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 18;
COMMIT;
