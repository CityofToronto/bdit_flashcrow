BEGIN;

DROP TABLE hacky_ids;
DROP TABLE caution_ids;

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 30;
COMMIT;
