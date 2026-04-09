BEGIN;

CREATE TABLE IF NOT EXISTS public.hacky_ids (
	id int4 GENERATED ALWAYS AS IDENTITY,
	centreline_id int8 NULL,
	CONSTRAINT hacky_ids_id_key UNIQUE (id)
);


CREATE TABLE IF NOT EXISTS public.caution_ids (
	id int4 GENERATED ALWAYS AS IDENTITY,
	centreline_id int8 NULL,
	CONSTRAINT caution_ids_id_key UNIQUE (id)
);


UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 31;
COMMIT;
