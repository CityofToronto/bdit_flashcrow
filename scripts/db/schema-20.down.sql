BEGIN;

ALTER TABLE study_requests
  ADD COLUMN "closed" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN "estimatedDeliveryDate" TIMESTAMP,
  ADD COLUMN "lastEditedAt" TIMESTAMP,
  ADD COLUMN "lastEditorId" BIGINT;
UPDATE study_requests SET
  "closed" = TRUE
WHERE "status" IN ('CANCELLED', 'COMPLETED', 'REJECTED');
UPDATE study_requests SET
  "estimatedDeliveryDate" = "dueDate";
ALTER TABLE study_requests
  ALTER COLUMN "estimatedDeliveryDate" SET NOT NULL;

ALTER TABLE study_requests_bulk
  ADD COLUMN "dueDate" TIMESTAMP,
  ADD COLUMN "estimatedDeliveryDate" TIMESTAMP,
  ADD COLUMN "lastEditedAt" TIMESTAMP,
  ADD COLUMN "lastEditorId" BIGINT,
  ADD COLUMN "reason" VARCHAR,
  ADD COLUMN "reasonOther" VARCHAR,
  ADD COLUMN "s1" VARCHAR,
  ADD COLUMN "selectionType" VARCHAR,
  ADD COLUMN "urgent" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE study_requests_bulk
  RENAME COLUMN "notes" TO "urgentReason";
ALTER TABLE study_requests_bulk
  ALTER COLUMN "urgentReason" DROP NOT NULL;
UPDATE study_requests_bulk SET
  "dueDate" = NOW() + interval '1 month',
  "estimatedDeliveryDate" = NOW() + interval '1 month',
  "reason" = 'OTHER',
  "reasonOther" = 'Unknown',
  "s1" = 's1:A',
  "selectionType" = 'POINTS',
  "urgentReason" = NULL;
ALTER TABLE study_requests_bulk
  ALTER COLUMN "dueDate" SET NOT NULL,
  ALTER COLUMN "estimatedDeliveryDate" SET NOT NULL,
  ALTER COLUMN "reason" SET NOT NULL,
  ALTER COLUMN "s1" SET NOT NULL,
  ALTER COLUMN "selectionType" SET NOT NULL;

-- SQL arrays are 1-indexed, and they return `NULL` for non-existent
-- indices; we use both of these properties below.
ALTER TABLE study_request_items
  ALTER COLUMN "filterUserId" TYPE BIGINT USING "filterUserId"[1];
WITH bulk_agg AS (
  SELECT
    srb.id,
    srb."userId" AS "filterUserId",
    srb."createdAt" AS "sortCreatedAt",
    srb."dueDate" AS "sortDueDate"
  FROM study_requests_bulk srb
  JOIN study_requests sr ON srb.id = sr."studyRequestBulkId"
  LEFT JOIN location_search.centreline lsc USING ("centrelineType", "centrelineId")
  GROUP BY srb.id
)
UPDATE study_request_items sri SET
  "filterUserId" = ba."filterUserId",
  "searchRequester" = u."uniqueName",
  "sortCreatedAt" = ba."sortCreatedAt",
  "sortDueDate" = ba."sortDueDate",
  "sortRequester" = u."uniqueName"
FROM bulk_agg ba, study_requests_bulk srb, users u
WHERE bulk AND ba.id = sri.id AND ba.id = srb.id AND srb."userId" = u.id;

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 19;
COMMIT;
