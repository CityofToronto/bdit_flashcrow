BEGIN;

DELETE FROM "study_request_status"
  WHERE "value" IN ('FLAGGED', 'REVIEWED', 'SUBMITTED', 'SCHEDULED', 'DATA_READY');

INSERT INTO "study_request_status"
  ("value", "label")
VALUES
  ('ACCEPTED', 'Accepted'),
  ('REJECTED', 'Rejected'),
  ('IN_PROGRESS', 'In Progress');

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 4;
COMMIT;
