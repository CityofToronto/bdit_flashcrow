BEGIN;

CREATE TABLE public.app_banner (
	id int4 GENERATED ALWAYS AS (1) STORED NULL,
	created_by text NULL,
	message text NULL,
	"type" text NULL,
	display bool NULL,
	CONSTRAINT app_banner_id_key UNIQUE (id)
);

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 29;
COMMIT;
