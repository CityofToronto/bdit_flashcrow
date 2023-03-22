BEGIN;

UPDATE study_requests sr
SET "studyType" = tor.study_type_new, 
    "studyTypeOther" = tor.study_type_other_new 
FROM types_for_other_requests tor
WHERE sr.id = tor.id;

/* update study_request_items for solo requests */

WITH solo_requests AS (
	SELECT sr.id
	FROM study_requests sr
	JOIN types_for_other_requests tor ON sr.id = tor.id
	WHERE "studyRequestBulkId" IS NULL
)
INSERT INTO study_request_items (
  SELECT
    FALSE AS bulk,
    sr."id",
    ARRAY[sr."assignedTo"] AS "filterAssignedTo",
    ARRAY[sr."status"] AS "filterStatus",
    ARRAY[sr."studyType"] AS "filterStudyType",
    ARRAY[sr."userId"] AS "filterUserId",
    sr."assignedTo" AS "searchAssignedTo",
    ARRAY[sr."id"] AS "searchId",
    lsc."description" AS "searchLocation",
    u."uniqueName" AS "searchRequester",
    sr."status" AS "searchStatus",
    sr."studyType" AS "searchStudyType",
    sr."createdAt" AS "sortCreatedAt",
    sr."dueDate" AS "sortDueDate",
    sr."id" AS "sortId",
    lsc."description" AS "sortLocation",
    u."uniqueName" AS "sortRequester",
    sr."urgent" AS "urgent"
  FROM study_requests sr
  LEFT JOIN location_search.centreline lsc USING ("centrelineType", "centrelineId")
  LEFT JOIN users u ON sr."userId" = u.id
  WHERE "studyRequestBulkId" IS NULL AND sr."id" IN (SELECT id FROM solo_requests)
)
ON CONFLICT (bulk, id) DO UPDATE SET
  "filterAssignedTo" = EXCLUDED."filterAssignedTo",
  "filterStatus" = EXCLUDED."filterStatus",
  "filterStudyType" = EXCLUDED."filterStudyType",
  "filterUserId" = EXCLUDED."filterUserId",
  "searchAssignedTo" = EXCLUDED."searchAssignedTo",
  "searchId" = EXCLUDED."searchId",
  "searchLocation" = EXCLUDED."searchLocation",
  "searchRequester" = EXCLUDED."searchRequester",
  "searchStatus" = EXCLUDED."searchStatus",
  "searchStudyType" = EXCLUDED."searchStudyType",
  "sortCreatedAt" = EXCLUDED."sortCreatedAt",
  "sortDueDate" = EXCLUDED."sortDueDate",
  "sortId" = EXCLUDED."sortId",
  "sortLocation" = EXCLUDED."sortLocation",
  "sortRequester" = EXCLUDED."sortRequester",
  "urgent" = EXCLUDED."urgent";

/* update study_request_items for project requests */

WITH project_requests AS (
	SELECT sr."studyRequestBulkId"
	FROM study_requests sr
	JOIN types_for_other_requests tor ON sr.id = tor.id
	WHERE "studyRequestBulkId" IS NOT NULL
	GROUP BY "studyRequestBulkId"
)
INSERT INTO study_request_items (
  WITH bulk_agg AS (
    SELECT
      srb.id,
      array_agg(DISTINCT(sr."assignedTo")) AS "filterAssignedTo",
      array_agg(DISTINCT(sr."status")) AS "filterStatus",
      array_agg(DISTINCT(sr."studyType")) AS "filterStudyType",
      array_agg(DISTINCT(sr."userId")) AS "filterUserId",
      array_to_string(array_agg(DISTINCT(COALESCE(sr."assignedTo", 'Unassigned'))), '|') AS "searchAssignedTo",
      array_agg(sr.id) AS "searchId",
      array_to_string(srb.name::text || array_agg(DISTINCT(lsc."description")), '|') AS "searchLocation",
      array_to_string(array_agg(DISTINCT(u."uniqueName")), '|') AS "searchRequester",
      array_to_string(array_agg(DISTINCT(sr."status")), '|') AS "searchStatus",
      array_to_string(array_agg(DISTINCT(sr."studyType")), '|') AS "searchStudyType",
      min(sr."createdAt") AS "sortCreatedAt",
      min(sr."dueDate") AS "sortDueDate",
      max(sr.id) AS "sortId",
      mode() WITHIN GROUP (ORDER BY u."uniqueName") AS "sortRequester",
      bool_or(sr."urgent") AS "urgent"
    FROM study_requests_bulk srb
    JOIN study_requests sr ON srb.id = sr."studyRequestBulkId"
    LEFT JOIN location_search.centreline lsc USING ("centrelineType", "centrelineId")
    LEFT JOIN users u ON sr."userId" = u.id
    WHERE srb.id IN (SELECT "studyRequestBulkId" FROM project_requests)
    GROUP BY srb.id
  )
  SELECT
    TRUE AS bulk,
    ba.id,
    ba."filterAssignedTo",
    ba."filterStatus",
    ba."filterStudyType",
    ba."filterUserId",
    ba."searchAssignedTo",
    ba."searchId",
    ba."searchLocation",
    ba."searchRequester",
    ba."searchStatus",
    ba."searchStudyType",
    ba."sortCreatedAt",
    ba."sortDueDate",
    ba."sortId",
    srb."name" AS "sortLocation",
    ba."sortRequester",
    ba."urgent"
  FROM bulk_agg ba
  JOIN study_requests_bulk srb ON ba.id = srb.id
  JOIN users u ON srb."userId" = u.id
  WHERE srb."id" IN (SELECT "studyRequestBulkId" FROM project_requests)
)
ON CONFLICT (bulk, id) DO UPDATE SET
  "filterAssignedTo" = EXCLUDED."filterAssignedTo",
  "filterStatus" = EXCLUDED."filterStatus",
  "filterStudyType" = EXCLUDED."filterStudyType",
  "filterUserId" = EXCLUDED."filterUserId",
  "searchAssignedTo" = EXCLUDED."searchAssignedTo",
  "searchId" = EXCLUDED."searchId",
  "searchLocation" = EXCLUDED."searchLocation",
  "searchRequester" = EXCLUDED."searchRequester",
  "searchStatus" = EXCLUDED."searchStatus",
  "searchStudyType" = EXCLUDED."searchStudyType",
  "sortCreatedAt" = EXCLUDED."sortCreatedAt",
  "sortDueDate" = EXCLUDED."sortDueDate",
  "sortId" = EXCLUDED."sortId",
  "sortLocation" = EXCLUDED."sortLocation",
  "sortRequester" = EXCLUDED."sortRequester",
  "urgent" = EXCLUDED."urgent";


UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 24;
COMMIT;
