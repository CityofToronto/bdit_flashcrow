CREATE SCHEMA IF NOT EXISTS collisions;

DROP TABLE IF EXISTS collisions.events;
ALTER TABLE collisions_new.events SET SCHEMA collisions;

DROP TABLE IF EXISTS collisions.involved;
ALTER TABLE collisions_new.involved SET SCHEMA collisions;

DROP TABLE IF EXISTS collisions.events_centreline;
ALTER TABLE collisions_new.events_centreline SET SCHEMA collisions;
