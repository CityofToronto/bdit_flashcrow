-- -1 is changed / validated 
-- 0 is not validated 
-- so before the primary key was year, accnb and then at some point they changed it to accnb 
-- some rows may hae the same accnb bc they have different rows for each person involved in the collision


CREATE OR REPLACE FUNCTION crosic.get_intersection(collision_lat NUMERIC, collision_long NUMERIC, tbl_name TEXT)
RETURNS NUMERIC AS $gid$
DECLARE 
gid NUMERIC;
BEGIN
EXECUTE 
(CASE WHEN tbl_name LIKE '%intersection%'
THEN 
format('SELECT gid
	FROM %s 
	WHERE ST_DWithin(
			geom, 
			ST_Transform(ST_SetSRID(ST_MakePoint(%s, %s), 4326), 98012), 
	   		50
			)
	AND 
	(intersec5 NOT LIKE ''%% Trl /%% Trl%%'' OR intersec5 LIKE ''%%/%%/%%'')
	AND intersec5 NOT LIKE ''%% Trl /%% Trl /%% Trl%%''
	ORDER BY geom <-> ST_Transform(ST_SetSRID(ST_MakePoint(%s, %s), 4326), 98012)

	LIMIT 1'
	, 
	tbl_name, collision_long::TEXT, collision_lat::TEXT, collision_long::TEXT, collision_lat::TEXT)
ELSE 

format(
	'
	SELECT gid
	FROM %s 
	WHERE ST_DWithin(
			geom, 
			ST_Transform(ST_SetSRID(ST_MakePoint(%s, %s), 4326), 98012), 
			200
			)
	AND 
	fcode_desc::text = ANY(ARRAY[''Collector''::character varying, ''Collector Ramp''::character varying, ''Local''::character varying, ''Major Arterial''::character varying, ''Major Arterial Ramp''::character varying, ''Minor Arterial''::character varying, ''Minor Arterial Ramp''::character varying, ''Pending''::character varying]::text[])
	ORDER BY geom <-> ST_Transform(ST_SetSRID(ST_MakePoint(%s, %s), 4326), 98012)
	LIMIT 1'
	, 
	tbl_name, collision_long::TEXT, collision_lat::TEXT, collision_long::TEXT, collision_lat::TEXT)
END
)
INTO gid;

RETURN gid;
END; 
$gid$ LANGUAGE plpgsql;



CREATE TABLE crosic.flashcrow_matched_gid AS (
SELECT accnb, accdate, stname1,streetype1, stname2, streetype2, longitude, latitude, output_gid_arr[1] AS gid, output_gid_arr[2] AS tbl_type, 	
	(CASE WHEN output_gid_arr[1] IS NOT NULL AND output_gid_arr[2] = 1
		THEN (SELECT gid FROM crosic.centreline_intersection WHERE gid = output_gid_arr[1])
		WHEN output_gid_arr[1] IS NOT NULL AND output_gid_arr[2] = 2
		THEN (SELECT gid FROM crosic.centreline WHERE gid = output_gid_arr[1])
		ELSE NULL
		END
		) AS geom 
	FROM 
	(
	SELECT *, 
			( CASE WHEN geom_int IS NOT NULL 
					THEN ARRAY[geom_int, 1]::NUMERIC[]
					ELSE ARRAY[crosic.get_intersection(latitude::NUMERIC, longitude::NUMERIC, 'gis.centreline_prj'::TEXT), 2]::NUMERIC[]
					END
			) AS output_gid_arr
			FROM 
			(
			SELECT DISTINCT ON (accnb, accdate) 
				accnb, accdate, stname1,streetype1, stname2, streetype2, longitude, latitude, 
				crosic.get_intersection(latitude::NUMERIC, longitude::NUMERIC, 'gis.centreline_intersection_prj'::TEXT) AS geom_int
			FROM traffic.acc
			 WHERE longitude IS NOT NULL AND latitude IS NOT NULL and accnb IS NOT NULL AND latitude > 43 AND longitude < -79
			) x
	) AS output_gid_arr_tbl
);


-- qucik testing I did after creating the view
/*
-- all gids that I wanted to be in output table are in the table
SELECT 
(SELECT COUNT(*) FROM crosic.traffic_acc_gid) gid_count, 
(SELECT COUNT(*) FROM (SELECT DISTINCT accnb, accdate FROM traffic.acc WHERE longitude IS NOT NULL AND latitude IS NOT NULL and accnb IS NOT NULL AND latitude > 43 AND longitude < -79) x) distinct_accnb_count


-- 13 802 unmatched collisions
SELECT COUNT(*) FROM crosic.traffic_acc_gid WHERE output_gid_arr[1] is NULL




-- inspect unmatched collisions
-- a lot happen in parking lots
SELECT *, ST_SetSRID(ST_MakePoint(longitude, latitude), 4326) geom
INTO crosic._traffic_acc_gid_unmatched
FROM crosic.traffic_acc_gid 
WHERE output_gid_arr[1] is NULL 

*/