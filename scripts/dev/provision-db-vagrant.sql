CREATE DATABASE flashcrow;
CREATE USER flashcrow WITH ENCRYPTED PASSWORD :pgPassword;
GRANT ALL PRIVILEGES ON DATABASE flashcrow TO flashcrow;

\c flashcrow
create extension postgis;
create extension fuzzystrmatch;
create extension postgis_tiger_geocoder;
create extension postgis_topology;
set search_path=public,tiger;
