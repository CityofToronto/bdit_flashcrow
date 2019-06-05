BEGIN;
CREATE TABLE "users" (
  "subject" VARCHAR(255) NOT NULL,
  "email" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  PRIMARY KEY ("subject"),
  UNIQUE ("email")
);

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 1;
COMMIT;
