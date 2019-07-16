CREATE SCHEMA IF NOT EXISTS collisions; 

DROP TABLE IF EXISTS collisions.events;

CREATE TABLE collisions.events AS (
    WITH col_events_raw AS (
        SELECT acc."ACCNB" AS accnb,
            acc."ACCDATE" AS accdate,
            acc."DAY_NO" AS day_no,
            acc."ACCTIME" AS acctime,
            max(acc."STNAME1") AS stname1,
            max(acc."STREETYPE1") AS streetype1,
            max(acc."DIR1") AS dir1,
            max(acc."STNAME2") AS stname2,
            max(acc."STREETYPE2") AS streetype2,
            max(acc."DIR2") AS dir2,
            max(acc."STNAME3") AS stname3,
            max(acc."STREETYPE3") AS streetype3,
            max(acc."DIR3") AS dir3,
            max(acc."LOCCOORD") AS loccoord,
            min(acc."ACCLASS") AS acclass,
            min(acc."ACCLOC") AS location_class,
            max(acc."IMPACTYPE") AS impactype,
            max(acc."LONGITUDE") AS longitude,
            max(acc."LATITUDE") AS latitude,
            min(acc."ROAD_CLASS") AS road_class,
            min(acc."PX") AS px,
            max(acc."LIGHT") AS light,
            max(acc."VISIBLE") AS visible,
            max(acc."RDSFCOND") AS rdsfcond
           FROM "TRAFFIC"."ACC" AS acc
          GROUP BY acc."ACCNB", acc."ACCDATE", acc."DAY_NO", acc."ACCTIME"
    ), 
events_id_data AS (
    SELECT row_number() OVER (ORDER BY acc."ACCDATE", acc."ACCTIME",  acc."ACCNB") AS collision_id,
    acc."ACCNB" AS accnb,
    acc."ACCDATE" AS accdate,
    acc."ACCTIME" AS acctime
    FROM "TRAFFIC"."ACC" AS acc
    GROUP BY acc."ACCNB", acc."ACCDATE", acc."ACCTIME"
)
SELECT z.collision_id,
    a.accnb AS collision_accnb,
    a.accdate AS collision_date,
    a.acctime AS collision_time,
    a.day_no,
    a.px, 
    a.latitude, 
    a.longitude
   FROM col_events_raw a
     JOIN events_id_data z ON z.accnb::text = a.accnb::text AND z.accdate = a.accdate AND z.acctime::text = a.acctime::text
  ORDER BY z.collision_id
); 
