BEGIN;

CREATE TABLE "sessions" (
  "id" UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP NOT NULL,
  "userId" BIGINT NOT NULL
);
CREATE UNIQUE INDEX "sessions_id" ON "sessions" ("id");

CREATE TABLE "job_metadata" (
  "jobId" UUID NOT NULL,
  "userId" BIGINT NOT NULL,
  "type" VARCHAR NOT NULL,
  "state" VARCHAR NOT NULL,
  "dismissed" BOOLEAN NOT NULL DEFAULT FALSE,
  "progressCurrent" BIGINT NOT NULL DEFAULT 0,
  "progressTotal" BIGINT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "startedAt" TIMESTAMP WITH TIME ZONE,
  "completedAt" TIMESTAMP WITH TIME ZONE,
  "result" JSONB
);
CREATE UNIQUE INDEX "job_metadata_jobId" ON "job_metadata" ("jobId");
CREATE INDEX "job_metadata_userId" ON "job_metadata" ("userId");

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 13;
COMMIT;
