BEGIN;

CREATE TABLE "study_request_status" (
  "value" VARCHAR PRIMARY KEY NOT NULL,
  "label" VARCHAR NOT NULL
);
INSERT INTO "study_request_status"
  ("value", "label")
VALUES
  ('REQUESTED', 'Requested'),
  ('COMPLETED', 'Completed'),
  ('ACCEPTED', 'Accepted'),
  ('REJECTED', 'Rejected'),
  ('IN_PROGRESS', 'In Progress');
ALTER TABLE "study_requests"
  ADD CONSTRAINT "study_requests_status_fkey"
  FOREIGN KEY (status) REFERENCES study_request_status(value);

CREATE TABLE "study_request_reasons" (
  "value" VARCHAR PRIMARY KEY NOT NULL,
  "label" VARCHAR NOT NULL
);
INSERT INTO "study_request_reasons"
  ("value", "label")
VALUES
  ('TSC', 'Traffic Signal Control'),
  ('PXO', 'Pedestrian Crossover (PXO)'),
  ('EXPIRED', 'Updated count (3 years expired)'),
  ('PED_SAFETY', 'Pedestrian Safety'),
  ('SIGNAL_TIMING', 'Signal Timing');

ALTER TABLE "study_requests" DROP COLUMN "urgentReason";

ALTER TABLE "study_requests" ADD COLUMN "priority" VARCHAR NOT NULL DEFAULT 'STANDARD';
UPDATE "study_requests" SET "priority" = 'URGENT' WHERE "urgent";
ALTER TABLE "study_requests" DROP COLUMN "urgent";

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 7;
COMMIT;
