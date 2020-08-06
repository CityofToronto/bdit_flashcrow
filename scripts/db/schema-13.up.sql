BEGIN;

CREATE TABLE "job_users" (
  "jobId" UUID NOT NULL,
  "userId" BIGINT NOT NULL
);
CREATE UNIQUE INDEX "job_users_jobId" ON "job_users" ("jobId");
CREATE INDEX "job_users_userId" ON "job_users" ("userId");

CREATE TABLE "job_metadata" (
  "jobId" UUID NOT NULL,
  "dismissed" BOOLEAN NOT NULL DEFAULT FALSE,
  "progressCurrent" BIGINT NOT NULL DEFAULT 0,
  "progressTotal" BIGINT NOT NULL,
  "metadata" JSONB
);
CREATE UNIQUE INDEX "job_metadata_jobId" ON "job_metadata" ("jobId");

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 13;
COMMIT;
