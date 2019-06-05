BEGIN;
CREATE TABLE "users" (
  "subject" VARCHAR NOT NULL,
  "email" VARCHAR NOT NULL,
  "name" VARCHAR NOT NULL,
  "token" TEXT NOT NULL,
  PRIMARY KEY ("subject"),
  UNIQUE ("email")
);

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 1;
COMMIT;
