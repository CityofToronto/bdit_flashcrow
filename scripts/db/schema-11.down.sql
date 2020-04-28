BEGIN;

CREATE TABLE "studies" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "userId" BIGINT NOT NULL REFERENCES "users" ("id"),
  "studyRequestId" BIGINT NOT NULL REFERENCES "study_requests" ("id"),
  "studyType" VARCHAR NOT NULL,
  "daysOfWeek" SMALLINT[] NOT NULL,
  "duration" SMALLINT DEFAULT NULL,
  "hours" VARCHAR DEFAULT NULL,
  "notes" VARCHAR NOT NULL
);
CREATE INDEX "studies_userId" ON "studies" ("userId");
CREATE INDEX "studies_studyRequestId" ON "studies" ("studyRequestId");

INSERT INTO "studies" (
  "createdAt",
  "userId",
  "studyRequestId",
  "studyType",
  "daysOfWeek",
  "duration",
  "hours",
  "notes"
) SELECT
  "createdAt",
  "userId",
  "id",
  "studyType",
  "daysOfWeek",
  "duration",
  "hours",
  "notes"
FROM "study_requests";

ALTER TABLE "study_requests"
  DROP COLUMN "studyType",
  DROP COLUMN "daysOfWeek",
  DROP COLUMN "duration",
  DROP COLUMN "hours",
  DROP COLUMN "notes";

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 10;
COMMIT;
