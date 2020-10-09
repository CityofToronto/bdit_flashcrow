BEGIN;

UPDATE "users" SET "scope" = array_remove("scope", 'STUDY_REQUESTS_EDIT');

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 17;
COMMIT;
