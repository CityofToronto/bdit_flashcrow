BEGIN;

UPDATE "users"
SET "scope" = array_append("scope", 'STUDY_REQUESTS_EDIT')
WHERE 'STUDY_REQUESTS' = ANY("scope");

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 16;
COMMIT;
