BEGIN;

ALTER TABLE public.users
ADD "userTitle" VARCHAR DEFAULT NULL,
ADD "firstName" VARCHAR DEFAULT NULL,
ADD "lastName" VARCHAR DEFAULT NULL,
ADD "department" VARCHAR DEFAULT NULL;

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 28;
COMMIT;
