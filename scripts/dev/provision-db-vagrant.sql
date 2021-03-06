CREATE DATABASE flashcrow;
CREATE USER flashcrow WITH ENCRYPTED PASSWORD :pgPassword;
GRANT ALL PRIVILEGES ON DATABASE flashcrow TO flashcrow;

\c flashcrow
create extension pgcrypto;
create extension postgis;
create extension fuzzystrmatch;
create extension pg_trgm;
create extension pgrouting;
set search_path=public,tiger;
