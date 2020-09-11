BEGIN;

CREATE TABLE "study_requests_bulk" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "userId" BIGINT NOT NULL REFERENCES "users" ("id"),
  "lastEditorId" BIGINT DEFAULT NULL REFERENCES "users" ("id"),
  "lastEditedAt" TIMESTAMP DEFAULT NULL,
  "ccEmails" VARCHAR[] NOT NULL,
  "dueDate" TIMESTAMP NOT NULL,
  "estimatedDeliveryDate" TIMESTAMP NOT NULL,
  "name" VARCHAR NOT NULL,
  "reason" VARCHAR NOT NULL,
  "reasonOther" VARCHAR,
  "s1" VARCHAR NOT NULL,
  "selectionType" VARCHAR NOT NULL,
  "urgent" BOOLEAN NOT NULL DEFAULT FALSE,
  "urgentReason" VARCHAR
);
CREATE INDEX "study_requests_bulk_userId" ON "study_requests_bulk" ("userId");

ALTER TABLE "study_requests" ADD COLUMN "studyRequestBulkId" BIGINT DEFAULT NULL REFERENCES "study_requests_bulk" ("id");

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 16;
COMMIT;
