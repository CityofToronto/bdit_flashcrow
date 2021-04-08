BEGIN;

CREATE MATERIALIZED VIEW study_request_items AS (
  WITH bulk_agg AS (
    SELECT
      srb.id,
      array_agg(DISTINCT(sr."assignedTo")) AS "filterAssignedTo",
      array_agg(DISTINCT(sr."status")) AS "filterStatus",
      array_agg(DISTINCT(sr."studyType")) AS "filterStudyType",
      array_to_string(array_agg(DISTINCT(COALESCE(sr."assignedTo", 'Unassigned'))), '|') AS "searchAssignedTo",
      array_agg(sr.id) AS "searchId",
      array_to_string(srb.name::text || array_agg(DISTINCT(lsc."description")), '|') AS "searchLocation",
      array_to_string(array_agg(DISTINCT(sr."status")), '|') AS "searchStatus",
      array_to_string(array_agg(DISTINCT(sr."studyType")), '|') AS "searchStudyType",
      srb."createdAt" AS "sortCreatedAt",
      srb."dueDate" AS "sortDueDate",
      max(sr.id) AS "sortId"
    FROM study_requests_bulk srb
    JOIN study_requests sr ON srb.id = sr."studyRequestBulkId"
    LEFT JOIN location_search.centreline lsc USING ("centrelineType", "centrelineId")
    GROUP BY srb.id
  )
  SELECT
    FALSE AS bulk,
    sr."id",
    ARRAY[sr."assignedTo"] AS "filterAssignedTo",
    ARRAY[sr."status"] AS "filterStatus",
    ARRAY[sr."studyType"] AS "filterStudyType",
    sr."userId" AS "filterUserId",
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
    u."uniqueName" AS "sortRequester"
  FROM study_requests sr
  LEFT JOIN location_search.centreline lsc USING ("centrelineType", "centrelineId")
  LEFT JOIN users u ON sr."userId" = u.id
  WHERE "studyRequestBulkId" IS NULL
  UNION ALL
  SELECT
    TRUE AS bulk,
    ba.id,
    ba."filterAssignedTo",
    ba."filterStatus",
    ba."filterStudyType",
    srb."userId" AS "filterUserId",
    ba."searchAssignedTo",
    ba."searchId",
    ba."searchLocation",
    u."uniqueName" AS "searchRequester",
    ba."searchStatus",
    ba."searchStudyType",
    ba."sortCreatedAt",
    ba."sortDueDate",
    ba."sortId",
    srb."name" AS "sortLocation",
    u."uniqueName" AS "sortRequester"
  FROM bulk_agg ba
  JOIN study_requests_bulk srb ON ba.id = srb.id
  JOIN users u ON srb."userId" = u.id
);
CREATE UNIQUE INDEX study_request_items_bulk_id ON study_request_items (bulk, id);

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 19;
COMMIT;
