BEGIN;

CREATE TABLE "study_request_assignees" (
  "value" VARCHAR PRIMARY KEY NOT NULL,
  "label" VARCHAR NOT NULL
);
INSERT INTO "study_request_assignees"
  ("value", "label")
VALUES
  ('OTI', 'OTI'),
  ('FIELD_STAFF', 'Field Staff');

ALTER TABLE "study_requests" ADD COLUMN "assignedTo" VARCHAR DEFAULT NULL;

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 5;
COMMIT;
