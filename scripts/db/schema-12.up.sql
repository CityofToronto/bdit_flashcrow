BEGIN;

-- forward migration SQL goes here
CREATE TABLE "study_request_changes" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "userId" BIGINT NOT NULL REFERENCES "users" ("id"),
  "studyRequestId" BIGINT NOT NULL REFERENCES "study_requests" ("id"),
  "status" VARCHAR NOT NULL
);
CREATE INDEX "study_request_changes_studyRequestId_createdAt" ON "study_request_changes" ("studyRequestId", "createdAt");

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 12;
COMMIT;
