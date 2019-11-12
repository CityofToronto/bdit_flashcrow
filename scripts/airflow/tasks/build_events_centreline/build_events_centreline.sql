DROP TABLE IF EXISTS collisions.events_centreline;
CREATE TABLE collisions.events_centreline AS (
	SELECT
		e.collision_id,
	  CASE
	    WHEN ei.int_id IS NOT NULL THEN 1
	    WHEN es.geo_id IS NOT NULL THEN 2
	  END as centreline_type,
	  COALESCE(ei.int_id, es.geo_id) AS centreline_id
	FROM collisions.events e
	LEFT JOIN collisions.events_intersections ei ON e.collision_id = ei.collision_id
	LEFT JOIN collisions.events_segments es ON e.collision_id = es.collision_id
);
CREATE UNIQUE INDEX events_centreline_collision_id ON collisions.events_centreline (collision_id);
