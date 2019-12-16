BEGIN;

CREATE TABLE "study_request_comments" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "userSubject" VARCHAR NOT NULL REFERENCES "users" ("subject"),
  "studyRequestId" BIGINT NOT NULL REFERENCES "study_requests" ("id"),
  "comment" VARCHAR NOT NULL
);
CREATE INDEX "study_request_comments_studyRequestId_createdAt" ON "study_request_comments" ("studyRequestId", "createdAt");

ALTER TABLE "study_requests" ADD COLUMN "closed" BOOLEAN DEFAULT FALSE;

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 6;
COMMIT;
