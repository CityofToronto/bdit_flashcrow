BEGIN;

-- backward migration SQL goes here
ALTER TABLE study_requests ADD COLUMN reasons VARCHAR[];
UPDATE study_requests SET reasons = ARRAY[reason];
ALTER TABLE study_requests ALTER COLUMN reasons SET NOT NULL;
ALTER TABLE study_requests DROP COLUMN reason;

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 14;
COMMIT;
