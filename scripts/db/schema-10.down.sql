BEGIN;

ALTER TABLE "users" DROP COLUMN "scope";

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 9;
COMMIT;
