BEGIN;

ALTER TABLE public.users
DROP COLUMN "userTitle",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "department";

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 27;
COMMIT;
