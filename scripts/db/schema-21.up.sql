BEGIN;

ALTER TABLE study_request_items
ADD COLUMN urgent BOOLEAN DEFAULT NULL;

UPDATE study_request_items AS sri
SET urgent = sr.urgent
FROM study_requests AS sr
WHERE NOT sri.bulk AND sri.id = sr.id;

UPDATE study_request_items AS sri
SET urgent = subq.urgent
FROM (
	SELECT srb.id AS id, bool_or(sr.urgent) AS urgent
	FROM study_requests_bulk AS srb
	JOIN study_requests AS sr ON srb.id = sr."studyRequestBulkId"
	GROUP BY srb.id
) AS subq
WHERE sri.bulk AND subq.id = sri.id;

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 21;
COMMIT;
