BEGIN;
DROP INDEX IF EXISTS "study_request_items_studyRequestId";
DROP INDEX IF EXISTS "study_request_items_userSubject";
DROP TABLE IF EXISTS "study_request_items" CASCADE;

DROP INDEX IF EXISTS "study_requests_geom";
DROP INDEX IF EXISTS "study_requests_centreline";
DROP INDEX IF EXISTS "study_requests_userSubject";
DROP TABLE IF EXISTS "study_requests" CASCADE;
UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 1;
COMMIT;
