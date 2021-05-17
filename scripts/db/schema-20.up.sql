BEGIN;

-- forward migration SQL goes here
ALTER TABLE study_requests
  DROP COLUMN "closed",
  DROP COLUMN "estimatedDeliveryDate",
  DROP COLUMN "lastEditedAt",
  DROP COLUMN "lastEditorId";

ALTER TABLE study_requests_bulk
  DROP COLUMN "dueDate",
  DROP COLUMN "estimatedDeliveryDate",
  DROP COLUMN "lastEditedAt",
  DROP COLUMN "lastEditorId",
  DROP COLUMN "reason",
  DROP COLUMN "reasonOther",
  DROP COLUMN "s1",
  DROP COLUMN "selectionType",
  DROP COLUMN "urgent";
ALTER TABLE study_requests_bulk
  RENAME COLUMN "urgentReason" TO "notes";
UPDATE study_requests_bulk SET
  "notes" = ''
WHERE "notes" IS NULL;
ALTER TABLE study_requests_bulk
  ALTER COLUMN "notes" SET NOT NULL;

ALTER TABLE study_request_items
  ALTER COLUMN "filterUserId" TYPE BIGINT[] USING ARRAY["filterUserId"];
WITH bulk_agg AS (
  SELECT
    srb.id,
    array_agg(DISTINCT(sr."userId")) AS "filterUserId",
    array_to_string(array_agg(DISTINCT(u."uniqueName")), '|') AS "searchRequester",
    min(sr."createdAt") AS "sortCreatedAt",
    min(sr."dueDate") AS "sortDueDate",
    mode() WITHIN GROUP (ORDER BY u."uniqueName") AS "sortRequester"
  FROM study_requests_bulk srb
  JOIN study_requests sr ON srb.id = sr."studyRequestBulkId"
  LEFT JOIN location_search.centreline lsc USING ("centrelineType", "centrelineId")
  LEFT JOIN users u ON sr."userId" = u.id
  GROUP BY srb.id
)
UPDATE study_request_items sri SET
  "filterUserId" = ba."filterUserId",
  "searchRequester" = ba."searchRequester",
  "sortCreatedAt" = ba."sortCreatedAt",
  "sortDueDate" = ba."sortDueDate",
  "sortRequester" = ba."sortRequester"
FROM bulk_agg ba
WHERE bulk AND ba.id = sri.id;

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 20;
COMMIT;
