DROP TYPE IF EXISTS gid_type CASCADE;
-- where I got inpsiration for how to implement the composite type: 
-- https://stackoverflow.com/questions/4284762/postgresql-select-from-function-that-returns-composite-type
CREATE TYPE gid_type AS (
	intersection_gid NUMERIC, 
	centreline_gid NUMERIC
);

CREATE OR REPLACE FUNCTION gis.signal_crossing_get_intersection(lat NUMERIC, long NUMERIC, intersection_tbl_name TEXT, centreline_tbl_name TEXT)
RETURNS gid_type AS $gids$
DECLARE 
gids gid_type; 
BEGIN

EXECUTE format('SELECT gid AS intersection_gid, NULL AS centreline_gid
	FROM %s 
	WHERE ST_DWithin(
			st_transform(geom, 26917), 
			ST_Transform(ST_SetSRID(ST_MakePoint(%s, %s), 4326), 26917), 
	   		15
			)
	AND 
	(intersec5 NOT LIKE ''%% Trl /%% Trl%%'' OR intersec5 LIKE ''%%/%%/%%'')
	AND intersec5 NOT LIKE ''%% Trl /%% Trl /%% Trl%%''
	ORDER BY st_transform(geom, 26917) <-> ST_Transform(ST_SetSRID(ST_MakePoint(%s, %s), 4326), 26917)
	LIMIT 1'::TEXT, intersection_tbl_name, long::TEXT, lat::TEXT, long::TEXT, lat::TEXT)
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
			LIMIT 1'::TEXT, centreline_tbl_name, long::TEXT, lat::TEXT, long::TEXT, lat::TEXT)
	END) 
INTO gids.centreline_gid;

RETURN gids;
END; 
$gids$ LANGUAGE plpgsql;



-- add column 
ALTER TABLE gis.traffic_signals ADD COLUMN IF NOT EXISTS gid_centreline_table TEXT; 
ALTER TABLE gis.traffic_signals ADD COLUMN IF NOT EXISTS gid INT;

-- CREATE TABLE OR SOMETHING 
UPDATE gis.traffic_signals ts
SET gid_centreline_table=subquery.table_name, 
gid=subquery.gid
FROM 
  (
	SELECT 
	e.px, (CASE WHEN intersection_gid IS NOT NULL THEN intersection_gid ELSE centreline_gid END) AS gid, 
	(CASE WHEN intersection_gid IS NOT NULL THEN 'gis.centreline_intersection'::TEXT ELSE 'gis.centreline'::TEXT END) AS table_name 
	FROM 
		gis.traffic_signals e
		JOIN LATERAL gis.signal_crossing_get_intersection(lat::NUMERIC, long::NUMERIC, 'gis.centreline_intersection'::TEXT, 'gis.centreline'::TEXT) AS gids ON TRUE
  ) subquery
WHERE ts.px=subquery.px; 


-- add column 
ALTER TABLE gis.pedestrian_crossings  ADD COLUMN IF NOT EXISTS gid_centreline_table TEXT; 
ALTER TABLE gis.pedestrian_crossings  ADD COLUMN IF NOT EXISTS gid INT;

-- CREATE TABLE OR SOMETHING 
UPDATE gis.pedestrian_crossings ts
SET gid_centreline_table=subquery.table_name, 
gid=subquery.gid
FROM 
  (
	SELECT 
	e.px, (CASE WHEN intersection_gid IS NOT NULL THEN intersection_gid ELSE centreline_gid END) AS gid, 
	(CASE WHEN intersection_gid IS NOT NULL THEN 'gis.centreline_intersection'::TEXT ELSE 'gis.centreline'::TEXT END) AS table_name 
	FROM 
		gis.pedestrian_crossings e
		JOIN LATERAL gis.signal_crossing_get_intersection(lat::NUMERIC, long::NUMERIC, 'gis.centreline_intersection'::TEXT, 'gis.centreline'::TEXT) AS gids ON TRUE
  ) subquery
WHERE ts.px=subquery.px; 
