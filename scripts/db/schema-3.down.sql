BEGIN;

ALTER TABLE "study_requests"
  ALTER COLUMN "createdAt" DROP NOT NULL,
  ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "studies"
  ALTER COLUMN "createdAt" DROP NOT NULL,
  ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 2;
COMMIT;
