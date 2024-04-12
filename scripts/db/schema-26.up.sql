BEGIN;

ALTER TABLE public.users
ADD "mvcrAddedAt" TIMESTAMP,
ADD "mvcrRemovedAt" TIMESTAMP,
ADD "mvcrAddedBy" BIGINT,
ADD "mvcrRemovedBy" BIGINT;

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 26;
COMMIT;
