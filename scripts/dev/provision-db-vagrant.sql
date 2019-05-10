CREATE DATABASE flashcrow;
CREATE USER flashcrow WITH ENCRYPTED PASSWORD :pgPassword;
GRANT ALL PRIVILEGES ON DATABASE flashcrow TO flashcrow;

\c flashcrow
