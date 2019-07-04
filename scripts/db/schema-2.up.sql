BEGIN;

CREATE TABLE "study_requests" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "userSubject" VARCHAR NOT NULL REFERENCES "users" ("subject"),
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

CREATE TABLE "study_request_items" (
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
CREATE INDEX "study_request_items_userSubject" ON "study_request_items" ("userSubject");
CREATE INDEX "study_request_items_studyRequestId" ON "study_request_items" ("studyRequestId");

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 2;
COMMIT;
