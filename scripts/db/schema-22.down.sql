BEGIN;

DROP TABLE mvcr_access_events;

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 21;
COMMIT;
