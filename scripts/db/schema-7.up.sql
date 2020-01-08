BEGIN;

DROP TABLE "study_request_comments" CASCADE;
DROP TABLE "studies" CASCADE;
DROP TABLE "study_requests" CASCADE;
DROP TABLE "users" CASCADE;

CREATE TABLE "users" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "email" VARCHAR NOT NULL,
  "sub" VARCHAR NOT NULL,
  "uniqueName" VARCHAR NOT NULL
);
CREATE UNIQUE INDEX users_sub ON "users" ("sub");

CREATE TABLE "study_requests" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "userId" BIGINT NOT NULL REFERENCES "users" ("id"),
  "status" VARCHAR NOT NULL REFERENCES "study_request_status" ("value"),
  "closed" BOOLEAN DEFAULT FALSE,
  "assignedTo" VARCHAR DEFAULT NULL,
  "serviceRequestId" VARCHAR DEFAULT NULL,
  "priority" VARCHAR NOT NULL,
  "dueDate" TIMESTAMP NOT NULL,
  "estimatedDeliveryDate" TIMESTAMP NOT NULL,
  "reasons" VARCHAR[] NOT NULL,
  "ccEmails" VARCHAR[] NOT NULL,
  "centrelineId" BIGINT NOT NULL,
  "centrelineType" SMALLINT NOT NULL,
  "geom" GEOMETRY(POINT, 4326) NOT NULL
);
CREATE INDEX "study_requests_userId" ON "study_requests" ("userId");
CREATE INDEX "study_requests_centreline" ON "study_requests" ("centrelineId", "centrelineType");
CREATE INDEX "study_requests_geom" ON "study_requests" USING GIST ("geom");

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

CREATE TABLE "study_request_comments" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "userId" BIGINT NOT NULL REFERENCES "users" ("id"),
  "studyRequestId" BIGINT NOT NULL REFERENCES "study_requests" ("id"),
  "comment" VARCHAR NOT NULL
);
CREATE INDEX "study_request_comments_studyRequestId_createdAt" ON "study_request_comments" ("studyRequestId", "createdAt");

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 7;
COMMIT;
