BEGIN;

DROP TABLE app_banner;

CREATE TABLE public.app_banner (
	id int4 GENERATED ALWAYS AS (1) STORED NULL,
	display_alert bool NULL,
	created_by text NULL,
	alert_text text NULL,
	alert_type text NULL,
	display_button bool NULL,
	button_link text NULL,
	button_text text NULL,
	CONSTRAINT app_banner_id_key UNIQUE (id)
);

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 30;
COMMIT;
