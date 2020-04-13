CREATE DATABASE flashcrow;
CREATE USER flashcrow WITH NOSUPERUSER NOCREATEDB NOCREATEROLE LOGIN PASSWORD ':flashcrowPassword';
GRANT ALL PRIVILEGES ON DATABASE flashcrow TO flashcrow;

CREATE DATABASE airflow;
CREATE USER airflow WITH NOSUPERUSER NOCREATEDB NOCREATEROLE LOGIN PASSWORD ':airflowPassword';
GRANT ALL PRIVILEGES ON DATABASE airflow TO airflow;

\c flashcrow
create schema "TRAFFIC";
create schema "TRAFFIC_NEW";
create extension postgis;
create extension fuzzystrmatch;
create extension postgis_tiger_geocoder;
create extension postgis_topology;
set search_path=public,tiger;

-- give flashcrow_dba relevant admin permissions
alter schema tiger owner to flashcrow_dba;
alter schema tiger_data owner to flashcrow_dba;
alter schema topology owner to flashcrow_dba;

CREATE FUNCTION exec(text) returns text language plpgsql volatile AS $f$ BEGIN EXECUTE $1; RETURN $1; END; $f$;
SELECT exec('ALTER TABLE ' || quote_ident(s.nspname) || '.' || quote_ident(s.relname) || ' OWNER TO flashcrow_dba;')
  FROM (
    SELECT nspname, relname
    FROM pg_class c JOIN pg_namespace n ON (c.relnamespace = n.oid)
    WHERE nspname in ('tiger','topology') AND
    relkind IN ('r','S','v') ORDER BY relkind = 'S')
s;

ALTER TABLE public.spatial_ref_sys OWNER TO flashcrow_dba;
GRANT SELECT, INSERT ON TABLE public.spatial_ref_sys TO flashcrow_dba;

-- SRID definitions
INSERT into spatial_ref_sys (srid, auth_name, auth_srid, proj4text, srtext) values ( 92019, 'epsg', 2019, '+proj=tmerc +lat_0=0 +lon_0=-79.5 +k=0.9999 +x_0=304800 +y_0=0 +ellps=clrk66 +units=m +no_defs ', 'PROJCS["NAD27(76) / MTM zone 10",GEOGCS["NAD27(76)",DATUM["North_American_Datum_1927_1976",SPHEROID["Clarke 1866",6378206.4,294.9786982138982,AUTHORITY["EPSG","7008"]],AUTHORITY["EPSG","6608"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.01745329251994328,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4608"]],UNIT["metre",1,AUTHORITY["EPSG","9001"]],PROJECTION["Transverse_Mercator"],PARAMETER["latitude_of_origin",0],PARAMETER["central_meridian",-79.5],PARAMETER["scale_factor",0.9999],PARAMETER["false_easting",304800],PARAMETER["false_northing",0],AUTHORITY["EPSG","2019"],AXIS["X",EAST],AXIS["Y",NORTH]]') ON CONFLICT DO NOTHING;
