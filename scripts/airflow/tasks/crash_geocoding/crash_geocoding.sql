-- INSERT INTO spatial_ref_sys (srid, auth_name, auth_srid, proj4text, srtext) values ( 98012, 'sr-org', 8012, '+proj=tmerc +lat_0=0 +lon_0=-79.5 +k=0.9999 +x_0=304800 +y_0=0 +ellps=clrk66 +units=m +no_defs ', 'PROJCS["MTM_3Degree",GEOGCS["GCS_North_American_1927",DATUM["D_North_American_1927",SPHEROID["Clarke_1866",6378206.4,294.9786982]],PRIMEM["Greenwich",0.0],UNIT["Degree",0.0174532925199433]],PROJECTION["Transverse_Mercator"],PARAMETER["False_Easting",304800.0],PARAMETER["False_Northing",0.0],PARAMETER["Central_Meridian",-79.5],PARAMETER["Scale_Factor",0.9999],PARAMETER["Latitude_Of_Origin",0.0],UNIT["Meter",1.0]]')
-- ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION collisions.get_intersection(collision_lat NUMERIC, collision_long NUMERIC, tbl_name TEXT)
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
			st_transform(geom, 26917), 
			ST_Transform(ST_SetSRID(ST_MakePoint(%s, %s), 4326), 26917), 
	   		50
			)
	AND 
	(intersec5 NOT LIKE ''%% Trl /%% Trl%%'' OR intersec5 LIKE ''%%/%%/%%'')
	AND intersec5 NOT LIKE ''%% Trl /%% Trl /%% Trl%%''
	ORDER BY st_transform(geom, 26917) <-> ST_Transform(ST_SetSRID(ST_MakePoint(%s, %s), 4326), 26917)
	LIMIT 1'
	, 
	tbl_name, collision_long::TEXT, collision_lat::TEXT, collision_long::TEXT, collision_lat::TEXT)
ELSE 

format(
	'
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
	LIMIT 1'
	, 
	tbl_name, collision_long::TEXT, collision_lat::TEXT, collision_long::TEXT, collision_lat::TEXT)
END
)
INTO gid;

RETURN gid;
END; 
$gid$ LANGUAGE plpgsql;


CREATE TABLE collisions.events_geocoded AS (
SELECT collision_accnb, collision_date, collision_time, day_no, px, longitude, latitude, output_gid_arr[1] AS gid, output_gid_arr[2] AS tbl_type, 	
	(CASE WHEN output_gid_arr[1] IS NOT NULL AND output_gid_arr[2] = 1
		THEN (SELECT geom FROM gis.centreline_intersection WHERE gid = output_gid_arr[1])
		WHEN output_gid_arr[1] IS NOT NULL AND output_gid_arr[2] = 2
		THEN (SELECT geom FROM gis.centreline WHERE gid = output_gid_arr[1])
		ELSE NULL
		END
		) AS geom 
	FROM 
	(
	SELECT *, 
			( CASE WHEN geom_int IS NOT NULL 
					THEN ARRAY[geom_int, 1]::NUMERIC[]
					ELSE ARRAY["TRAFFIC".get_intersection(latitude::NUMERIC, longitude::NUMERIC, 'gis.centreline'::TEXT), 2]::NUMERIC[]
					END
			) AS output_gid_arr
			FROM 
			(
			SELECT DISTINCT ON (collision_id, collision_accnb, collision_date, collision_time) 
				*,
				collisions.get_intersection(latitude::NUMERIC, longitude::NUMERIC, 'gis.centreline_intersection'::TEXT) AS geom_int
			FROM collisions.events
			 WHERE longitude IS NOT NULL AND latitude IS NOT NULL and collision_accnb IS NOT NULL AND latitude > 43 AND longitude < -79
			) x
	) AS output_gid_arr_tbl
);
