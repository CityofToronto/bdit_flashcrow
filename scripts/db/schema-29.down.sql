BEGIN;

DROP TABLE app_banner;

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 28;
COMMIT;
