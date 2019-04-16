-- for the triggers, I used my tables created in create_test_tbl.sql
-- crosic.test_set_flashcrow_12 -> collision - centreline lookup table
-- crosic.test_set_flashcrow_12_collisions -> collisions table 


-- insert into collision table
-- a row in the matching geoid to collsion table is inserted
CREATE OR REPLACE FUNCTION insert_trigger_function() 
RETURNS trigger AS $$
DECLARE 
geom_int NUMERIC;
gid_arr NUMERIC[];
BEGIN 

	geom_int := (
	SELECT crosic.get_intersection(NEW.latitude::NUMERIC, NEW.longitude::NUMERIC, 'gis.centreline_intersection_prj'::TEXT)
	); 
	
	gid_arr :=  (SELECT 
	CASE WHEN geom_int IS NOT NULL 
	THEN ARRAY[geom_int, 1]::NUMERIC[]
	ELSE ARRAY[crosic.get_intersection(NEW.latitude::NUMERIC, NEW.longitude::NUMERIC, 'gis.centreline_prj'::TEXT), 2]::NUMERIC[]
	END
	);

	INSERT INTO crosic.test_set_flashcrow_12(accnb, accdate, longitude, latitude, gid, geo_type)
	VALUES(NEW.accnb, NEW.accdate, NEW.longitude, NEW.latitude, gid_arr[1], gid_arr[2]);
	RETURN NEW;

END;
$$ 
LANGUAGE 'plpgsql';


CREATE TRIGGER insert_trigger AFTER INSERT
ON crosic.test_set_flashcrow_12_collisions
FOR EACH ROW 
EXECUTE PROCEDURE insert_trigger_function();



-- update collision table
-- row(s) in the matching geoid to collsion table with the same primary key (accnb, accdate) is updated
CREATE OR REPLACE FUNCTION update_trigger_function() 
RETURNS trigger AS $$
DECLARE 
geom_int NUMERIC;
gid_arr NUMERIC[];
BEGIN 

	geom_int := (
	SELECT crosic.get_intersection(NEW.latitude::NUMERIC, NEW.longitude::NUMERIC, 'gis.centreline_intersection_prj'::TEXT)
	); 
	
	gid_arr := (
	SELECT 
	CASE WHEN geom_int IS NOT NULL 
	THEN ARRAY[geom_int, 1]::NUMERIC[]
	ELSE ARRAY[crosic.get_intersection(NEW.latitude::NUMERIC, NEW.longitude::NUMERIC, 'gis.centreline_prj'::TEXT), 2]::NUMERIC[]
	END
	);

	UPDATE crosic.test_set_flashcrow_12 x
	SET gid = gid_arr[1], geo_type = gid_arr[2], latitude = NEW.latitude, longitude = NEW.longitude
	WHERE x.accnb = NEW.accnb AND x.accdate = NEW.accdate;
	RETURN NEW;

END;
$$ 
LANGUAGE 'plpgsql';


CREATE TRIGGER update_trigger AFTER UPDATE
ON crosic.test_set_flashcrow_12_collisions
FOR EACH ROW 
EXECUTE PROCEDURE update_trigger_function();







-- test 
--INSERT INTO crosic.test_set_flashcrow_12_collisions VALUES ('123123', '2008-01-01 00:00:00'::DATE, 43.6459,  -79.3688);

--UPDATE crosic.test_set_flashcrow_12_collisions
--SET longitude = -79.4347686767578, latitude = 43.6332893371582
--WHERE accnb = '123123';



