BEGIN;

ALTER TABLE "study_requests" ADD COLUMN "lastEditorId" BIGINT DEFAULT NULL REFERENCES "users" ("id");
ALTER TABLE "study_requests" ADD COLUMN "lastEditedAt" TIMESTAMP DEFAULT NULL;

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 9;
COMMIT;
