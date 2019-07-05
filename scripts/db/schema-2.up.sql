BEGIN;

CREATE TABLE "study_request_reasons" (
  "value" VARCHAR PRIMARY KEY NOT NULL,
  "label" VARCHAR NOT NULL
);
INSERT INTO "study_request_reasons"
  ("value", "label")
VALUES
  ('TSC', 'Traffic Signal Control'),
  ('PXO', 'Pedestrian Crossover (PXO)'),
  ('EXPIRED', 'Updated count (3 years expired)'),
  ('PED_SAFETY', 'Pedestrian Safety'),
  ('SIGNAL_TIMING', 'Signal Timing');

CREATE TABLE "study_request_status" (
  "value" VARCHAR PRIMARY KEY NOT NULL,
  "label" VARCHAR NOT NULL
);
INSERT INTO "study_request_status"
  ("value", "label")
VALUES
  ('REQUESTED', 'Requested'),
  ('FLAGGED', 'Flagged'),
  ('REVIEWED', 'Reviewed'),
  ('SUBMITTED', 'Submitted'),
  ('SCHEDULED', 'Scheduled'),
  ('DATA_READY', 'Data Ready'),
  ('COMPLETED', 'Completed');

CREATE TABLE "study_requests" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "userSubject" VARCHAR NOT NULL REFERENCES "users" ("subject"),
  "status" VARCHAR NOT NULL REFERENCES "study_request_status" ("value"),
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

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 2;
COMMIT;
