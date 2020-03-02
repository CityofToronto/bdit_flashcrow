CREATE SCHEMA IF NOT EXISTS collisions;
CREATE INDEX IF NOT EXISTS centreline_srid2952_geom_idx ON gis.centreline USING gist (ST_Transform(geom, 2952));

CREATE MATERIALIZED VIEW IF NOT EXISTS collisions.events_segments AS (
  SELECT e.collision_id, u.geo_id FROM
		(SELECT collision_id, latitude, longitude FROM collisions.events) e
	  INNER JOIN LATERAL
		(SELECT geo_id, ST_Distance(
			ST_Transform(geom, 2952),
			ST_Transform(ST_SetSRID(ST_MakePoint(e.longitude, e.latitude), 4326), 2952)
	  ) AS geom_dist
		FROM gis.centreline
		WHERE
			ST_DWithin(
		    ST_Transform(geom, 2952),
				ST_Transform(ST_SetSRID(ST_MakePoint(e.longitude, e.latitude), 4326), 2952),
		    30
		  )
			AND (fcode <= 201500 OR fcode = 201800)
	  ORDER BY geom_dist ASC
	  LIMIT 1
	) u ON true
);
CREATE UNIQUE INDEX IF NOT EXISTS events_segments_collision_id ON collisions.events_segments (collision_id);

REFRESH MATERIALIZED VIEW CONCURRENTLY collisions.events_segments;
