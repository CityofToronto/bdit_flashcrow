BEGIN;

ALTER TABLE public.users
DROP COLUMN "mvcrAddedAt",
DROP COLUMN "mvcrRemovedAt",
DROP COLUMN "mvcrAddedBy",
DROP COLUMN "mvcrRemovedBy";

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 25;
COMMIT;
