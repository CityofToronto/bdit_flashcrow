BEGIN;

ALTER TABLE "study_requests" DROP COLUMN "lastEditedAt";
ALTER TABLE "study_requests" DROP COLUMN "lastEditorId";

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 8;
COMMIT;
