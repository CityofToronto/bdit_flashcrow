CREATE SCHEMA IF NOT EXISTS collisions_new;
CREATE INDEX IF NOT EXISTS centreline_intersection_srid26917_geom_idx ON gis.centreline_intersection USING gist (ST_Transform(geom, 26917));

DROP TABLE IF EXISTS collisions_new.events_intersections;
CREATE TABLE collisions_new.events_intersections AS (
	SELECT e.collision_id, u.int_id FROM
		(SELECT collision_id, latitude, longitude FROM collisions_new.events) e
	  INNER JOIN LATERAL
		(SELECT int_id, ST_Distance(
			ST_Transform(geom, 26917),
			ST_Transform(ST_SetSRID(ST_MakePoint(e.longitude, e.latitude), 4326), 26917)
	  ) AS geom_dist
		FROM gis.centreline_intersection
		WHERE
			ST_DWithin(
		    ST_Transform(geom, 26917),
				ST_Transform(ST_SetSRID(ST_MakePoint(e.longitude, e.latitude), 4326), 26917),
		    30
		  )
			AND (intersec5 NOT LIKE '% Trl /% Trl%' OR intersec5 LIKE '%/%/%')
			AND intersec5 NOT LIKE '% Trl /% Trl /% Trl%'
	  ORDER BY geom_dist ASC
	  LIMIT 1
	) u ON true
);
CREATE UNIQUE INDEX events_intersections_collision_id ON collisions_new.events_intersections (collision_id);
