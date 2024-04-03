BEGIN;


CREATE TABLE IF NOT EXISTS public.app_logs
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    user_id integer,
    severity text COLLATE pg_catalog."default",
    log_message text,
	  log_details jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT app_logs_pkey PRIMARY KEY (id),
    CONSTRAINT app_log_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = 25;
COMMIT;
