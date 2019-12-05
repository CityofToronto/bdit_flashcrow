BEGIN;

DELETE FROM "study_request_status"
  WHERE "value" IN ('ACCEPTED', 'REJECTED', 'IN_PROGRESS');

INSERT INTO "study_request_status"
  ("value", "label")
VALUES
  ('FLAGGED', 'Flagged'),
  ('REVIEWED', 'Reviewed'),
  ('SUBMITTED', 'Submitted'),
  ('SCHEDULED', 'Scheduled'),
  ('DATA_READY', 'Data Ready');

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 3;
COMMIT;
