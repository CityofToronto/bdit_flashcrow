BEGIN;

ALTER TABLE public.users
ADD "mvcrExpiryDate" TIMESTAMP DEFAULT NULL,
ADD "mvcrAcctType" SMALLINT DEFAULT 0,
DROP COLUMN "mvcrAddedAt",
DROP COLUMN "mvcrRemovedAt",
DROP COLUMN "mvcrAddedBy",
DROP COLUMN "mvcrRemovedBy";

UPDATE public.users SET "mvcrAcctType" = 2 WHERE 'MVCR_READ'=ANY(scope);

CREATE TABLE mvcr_permission_events (
    "adminId" INT NOT NULL REFERENCES users (id),
    "userId" INT NOT NULL REFERENCES users (id),
    "eventDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventAction" TEXT NOT NULL,
    "accessPrevious" INT NOT NULL,
    "accessNew" INT NOT NULL
);

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 27;
COMMIT;
