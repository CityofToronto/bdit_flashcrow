BEGIN;

ALTER TABLE study_requests DROP COLUMN "serviceRequestId";

ALTER TABLE study_requests ADD COLUMN reason VARCHAR;
UPDATE study_requests SET reason = reasons[1];
ALTER TABLE study_requests ALTER COLUMN reason SET NOT NULL;
ALTER TABLE study_requests DROP COLUMN reasons;

ALTER TABLE study_requests ADD COLUMN "reasonOther" VARCHAR;

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 15;
COMMIT;
