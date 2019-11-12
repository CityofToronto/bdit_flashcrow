CREATE INDEX IF NOT EXISTS centreline_srid26917_geom_idx ON gis.centreline USING gist (ST_Transform(geom, 26917));

DROP TABLE IF EXISTS collisions_new.events_segments;
CREATE TABLE collisions_new.events_segments AS (
  SELECT e.collision_id, u.geo_id FROM
		(SELECT collision_id, latitude, longitude FROM collisions_new.events) e
	  INNER JOIN LATERAL
		(SELECT geo_id, ST_Distance(
			ST_Transform(geom, 26917),
			ST_Transform(ST_SetSRID(ST_MakePoint(e.longitude, e.latitude), 4326), 26917)
	  ) AS geom_dist
		FROM gis.centreline
		WHERE
			ST_DWithin(
		    ST_Transform(geom, 26917),
				ST_Transform(ST_SetSRID(ST_MakePoint(e.longitude, e.latitude), 4326), 26917),
		    30
		  )
			AND (fcode <= 201500 OR fcode = 201800)
	  ORDER BY geom_dist ASC
	  LIMIT 1
	) u ON true
);
CREATE UNIQUE INDEX events_segments_collision_id ON collisions_new.events_segments (collision_id);
