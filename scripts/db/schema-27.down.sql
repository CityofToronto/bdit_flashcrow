BEGIN;

ALTER TABLE public.users
DROP COLUMN "mvcrExpiryDate",
DROP COLUMN "mvcrAcctType",
ADD "mvcrAddedAt" TIMESTAMP,
ADD "mvcrRemovedAt" TIMESTAMP,
ADD "mvcrAddedBy" BIGINT,
ADD "mvcrRemovedBy" BIGINT;

DROP TABLE mvcr_permission_events;

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 26;
COMMIT;
