BEGIN;
DROP INDEX IF EXISTS "studies_studyRequestId";
DROP INDEX IF EXISTS "studies_userSubject";
DROP TABLE IF EXISTS "studies";

DROP INDEX IF EXISTS "study_requests_geom";
DROP INDEX IF EXISTS "study_requests_centreline";
DROP INDEX IF EXISTS "study_requests_userSubject";
DROP TABLE IF EXISTS "study_requests";

DROP TABLE IF EXISTS "study_request_status";
DROP TABLE IF EXISTS "study_request_reasons";

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 1;
COMMIT;
