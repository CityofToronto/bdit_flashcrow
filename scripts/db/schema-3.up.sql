BEGIN;

ALTER TABLE "study_requests"
  ALTER COLUMN "createdAt" DROP DEFAULT,
  ALTER COLUMN "createdAt" SET NOT NULL;

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 3;
COMMIT;
