BEGIN;

CREATE MATERIALIZED VIEW study_request_items AS (
  WITH bulk_agg AS (
    SELECT
      srb.id,
      srb."createdAt" AS "sortCreatedAt",
      srb."dueDate" AS "sortDueDate",
      max(sr.id) AS "sortId"
    FROM study_requests_bulk srb
    JOIN study_requests sr ON srb.id = sr."studyRequestBulkId"
    GROUP BY srb.id
  )
  SELECT
    FALSE AS bulk,
    sr.id,
    sr."createdAt" AS "sortCreatedAt",
    sr."dueDate" AS "sortDueDate",
    sr.id AS "sortId",
    u."uniqueName" AS "sortRequester"
  FROM study_requests sr
  LEFT JOIN users u ON sr."userId" = u.id
  WHERE "studyRequestBulkId" IS NULL
  UNION ALL
  SELECT
    TRUE AS bulk,
    ba.id,
    ba."sortCreatedAt",
    ba."sortDueDate",
    ba."sortId",
    u."uniqueName" AS "sortRequester"
  FROM bulk_agg ba
  JOIN study_requests_bulk srb ON ba.id = srb.id
  JOIN users u ON srb."userId" = u.id
);
CREATE UNIQUE INDEX study_request_items_bulk_id ON study_request_items (bulk, id);

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 19;
COMMIT;
