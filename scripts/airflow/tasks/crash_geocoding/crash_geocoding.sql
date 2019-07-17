DROP TYPE IF EXISTS gid_type CASCADE;
-- where I got inpsiration for how to implement the composite type: 
-- https://stackoverflow.com/questions/4284762/postgresql-select-from-function-that-returns-composite-type
CREATE TYPE gid_type AS (
	intersection_gid NUMERIC, 
	centreline_gid NUMERIC
);

CREATE OR REPLACE FUNCTION collisions.get_intersection(collision_lat NUMERIC, collision_long NUMERIC, intersection_tbl_name TEXT, centreline_tbl_name TEXT)
RETURNS gid_type AS $gids$
DECLARE 
gids gid_type; 
BEGIN

EXECUTE format('SELECT gid AS intersection_gid, NULL AS centreline_gid
	FROM %s 
	WHERE ST_DWithin(
			st_transform(geom, 26917), 
			ST_Transform(ST_SetSRID(ST_MakePoint(%s, %s), 4326), 26917), 
	   		50
			)
	AND 
	(intersec5 NOT LIKE ''%% Trl /%% Trl%%'' OR intersec5 LIKE ''%%/%%/%%'')
	AND intersec5 NOT LIKE ''%% Trl /%% Trl /%% Trl%%''
	ORDER BY st_transform(geom, 26917) <-> ST_Transform(ST_SetSRID(ST_MakePoint(%s, %s), 4326), 26917)
	LIMIT 1'::TEXT, intersection_tbl_name, collision_long::TEXT, collision_lat::TEXT, collision_long::TEXT, collision_lat::TEXT)
INTO gids.intersection_gid;

EXECUTE 
(
	CASE WHEN (SELECT gids.intersection_gid) IS NOT NULL 
	THEN 
	-- since the collision is already assigned to an intersection, dont assign it to a centreline segment
	'SELECT 0'
	ELSE 
	format('
			SELECT gid
			FROM %s 
			WHERE ST_DWithin(
					st_transform(geom, 26917), 
					ST_Transform(ST_SetSRID(ST_MakePoint(%s, %s), 4326), 26917), 
					200
					)
			AND 
			fcode_desc::text = ANY(ARRAY[''Collector''::character varying, ''Collector Ramp''::character varying, ''Local''::character varying, ''Major Arterial''::character varying, ''Major Arterial Ramp''::character varying, ''Minor Arterial''::character varying, ''Minor Arterial Ramp''::character varying, ''Pending''::character varying]::text[])
			ORDER BY st_transform(geom, 26917) <-> ST_Transform(ST_SetSRID(ST_MakePoint(%s, %s), 4326), 26917)
			LIMIT 1'::TEXT, centreline_tbl_name, collision_long::TEXT, collision_lat::TEXT, collision_long::TEXT, collision_lat::TEXT)
	END) 
INTO gids.centreline_gid;

RETURN gids;
END; 
$gids$ LANGUAGE plpgsql;


DROP TABLE IF EXISTS collisions.events_geocoded; 
CREATE TABLE collisions.events_geocoded AS (
SELECT *
	FROM 
	(
		SELECT DISTINCT ON (collision_id, collision_accnb, day_no, collision_time) 
		e.*, (CASE WHEN intersection_gid IS NOT NULL THEN intersection_gid ELSE centreline_gid END) AS gid, 
		(CASE WHEN intersection_gid IS NOT NULL THEN 'gis.centreline_intersection'::TEXT ELSE 'gis.centreline'::TEXT END) AS table_name 
		FROM 
			collisions.events e
			JOIN LATERAL collisions.get_intersection(latitude::NUMERIC, longitude::NUMERIC, 'gis.centreline_intersection'::TEXT, 'gis.centreline'::TEXT) AS gids ON TRUE
		WHERE longitude IS NOT NULL AND latitude IS NOT NULL and collision_accnb IS NOT NULL AND latitude > 43 AND longitude < -79
		) x
);
