DROP TABLE crosic.test_set_flashcrow_12;

CREATE TABLE crosic.test_set_flashcrow_12  AS (
	SELECT DISTINCT accnb, accdate, -- stname1, stname2, 
	longitude, latitude -- , ST_SetSRID(ST_MakePoint(longitude, latitude), 4326) geom
	FROM traffic.acc
	WHERE accnb IN ('1012635', '1013233', '1012201', '1012623', 
					'1012649', '175986', '158000148', '158000149', 
                                        '158000186', '158000223', '158000294')
	
);


ALTER TABLE crosic.test_set_flashcrow_12 ADD COLUMN gid numeric; 
ALTER TABLE crosic.test_set_flashcrow_12 ADD COLUMN geo_type numeric; 


UPDATE crosic.test_set_flashcrow_12 
SET gid = 89216, geo_type = 2
WHERE accnb = '158000148';


UPDATE crosic.test_set_flashcrow_12 
SET gid = 75515, geo_type = 1
WHERE accnb = '1013233';

UPDATE crosic.test_set_flashcrow_12 
SET gid = 83498, geo_type = 1
WHERE accnb = '1012635';

UPDATE crosic.test_set_flashcrow_12 
SET gid = 83540, geo_type = 1
WHERE accnb = '158000294';


UPDATE crosic.test_set_flashcrow_12 
SET gid = 59489, geo_type = 1
WHERE accnb = '158000186';

UPDATE crosic.test_set_flashcrow_12 
SET gid = 93357, geo_type = 2
WHERE accnb = '1012623';

UPDATE crosic.test_set_flashcrow_12 
SET gid = 96192, geo_type = 2
WHERE accnb = '1012649';

UPDATE crosic.test_set_flashcrow_12 
SET gid = 70435, geo_type = 1
WHERE accnb = '158000223';

UPDATE crosic.test_set_flashcrow_12 
SET gid = 66610, geo_type = 1
WHERE accnb = '158000149';

UPDATE crosic.test_set_flashcrow_12 
SET gid = 84048, geo_type = 1
WHERE accnb = '175986';

UPDATE crosic.test_set_flashcrow_12 
SET gid = 82104, geo_type = 1
WHERE accnb = '1012201';


DROP TABLE IF EXISTS crosic.test_set_flashcrow_12_collisions;
SELECT accnb,accdate, latitude, longitude 
INTO crosic.test_set_flashcrow_12_collisions
FROM crosic.test_set_flashcrow_12 ;






--SELECT * FROM crosic.test_set_flashcrow_12 

--SELECT * FROM crosic.test_set_flashcrow_12_collisions;
