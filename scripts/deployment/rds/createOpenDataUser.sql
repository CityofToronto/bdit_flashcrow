CREATE USER :username WITH NOSUPERUSER NOCREATEDB NOCREATEROLE LOGIN PASSWORD ':password';
GRANT CONNECT ON DATABASE flashcrow TO :username;

GRANT USAGE ON SCHEMA open_data TO :username;
GRANT SELECT ON ALL TABLES IN SCHEMA open_data TO :username;
ALTER DEFAULT PRIVILEGES IN SCHEMA open_data
	GRANT SELECT ON TABLES TO :username;

GRANT SELECT ON public.geography_columns TO :username;
GRANT SELECT ON public.geometry_columns TO :username;
GRANT SELECT ON public.spatial_ref_sys TO :username;
