BEGIN;
CREATE TABLE "study_requests" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "userSubject" VARCHAR NOT NULL REFERENCES "users" ("subject"),
  "serviceRequestId" VARCHAR DEFAULT NULL,
  "priority" VARCHAR NOT NULL,
  "dueDate" TIMESTAMP,
  "reasons" VARCHAR[] NOT NULL,
  "ccEmails" VARCHAR[] NOT NULL,
  "centrelineId" BIGINT NOT NULL,
  "centrelineType" SMALLINT NOT NULL,
  "geom" GEOMETRY(POINT, 4326) NOT NULL
);
CREATE INDEX "study_requests_userSubject" ON "study_requests" ("userSubject");
CREATE INDEX "study_requests_centreline" ON "study_requests" ("centrelineId", "centrelineType");
CREATE INDEX "study_requests_geom" ON "study_requests" USING GIST ("geom");

CREATE TABLE "study_request_items" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "studyRequestId" BIGINT NOT NULL REFERENCES "study_requests" ("id"),
  -- This would reference "TRAFFIC"."CATEGORY", but due to the DROP TABLE
  -- part of replication we don't want to do that.
  "categoryId" BIGINT NOT NULL,
  "daysOfWeek" SMALLINT[] NOT NULL,
  "duration" SMALLINT DEFAULT NULL,
  "hours" VARCHAR DEFAULT NULL,
  "notes" VARCHAR NOT NULL
);

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 2;
COMMIT;
