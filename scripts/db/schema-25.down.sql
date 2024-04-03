BEGIN;

DROP TABLE app_logs;

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 24;
COMMIT;
