BEGIN;

DROP TABLE "study_request_comments" CASCADE;
DROP TABLE "studies" CASCADE;
DROP TABLE "study_requests" CASCADE;
DROP TABLE "users" CASCADE;

CREATE TABLE "users" (
  "subject" VARCHAR NOT NULL,
  "email" VARCHAR NOT NULL,
  "name" VARCHAR NOT NULL,
  "token" TEXT NOT NULL,
  PRIMARY KEY ("subject"),
  UNIQUE ("email")
);

CREATE TABLE "study_requests" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "userSubject" VARCHAR NOT NULL REFERENCES "users" ("subject"),
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
CREATE INDEX "study_requests_userSubject" ON "study_requests" ("userSubject");
CREATE INDEX "study_requests_centreline" ON "study_requests" ("centrelineId", "centrelineType");
CREATE INDEX "study_requests_geom" ON "study_requests" USING GIST ("geom");

CREATE TABLE "studies" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "userSubject" VARCHAR NOT NULL REFERENCES "users" ("subject"),
  "studyRequestId" BIGINT NOT NULL REFERENCES "study_requests" ("id"),
  "studyType" VARCHAR NOT NULL,
  "daysOfWeek" SMALLINT[] NOT NULL,
  "duration" SMALLINT DEFAULT NULL,
  "hours" VARCHAR DEFAULT NULL,
  "notes" VARCHAR NOT NULL
);
CREATE INDEX "studies_userSubject" ON "studies" ("userSubject");
CREATE INDEX "studies_studyRequestId" ON "studies" ("studyRequestId");

CREATE TABLE "study_request_comments" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "userSubject" VARCHAR NOT NULL REFERENCES "users" ("subject"),
  "studyRequestId" BIGINT NOT NULL REFERENCES "study_requests" ("id"),
  "comment" VARCHAR NOT NULL
);
CREATE INDEX "study_request_comments_studyRequestId_createdAt" ON "study_request_comments" ("studyRequestId", "createdAt");

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 6;
COMMIT;
