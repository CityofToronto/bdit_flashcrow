BEGIN;

CREATE TABLE "job_metadata" (
  "jobId" UUID NOT NULL,
  "userId" BIGINT NOT NULL,
  "progressCurrent" BIGINT NOT NULL DEFAULT 0,
  "progressTotal" BIGINT NOT NULL,
  "metadata" JSONB
);
CREATE UNIQUE INDEX "job_metadata_jobId" ON "job_metadata" ("jobId");
CREATE INDEX "job_metadata_userId" ON "job_metadata" ("userId");

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 13;
COMMIT;
