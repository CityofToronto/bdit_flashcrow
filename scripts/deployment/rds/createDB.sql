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
create extension pg_trgm;
set search_path=public,tiger;
CREATE FUNCTION exec(text) returns text language plpgsql volatile AS $f$ BEGIN EXECUTE $1; RETURN $1; END; $f$;
