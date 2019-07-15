DROP TABLE IF EXISTS "TRAFFIC".collision_events;

CREATE TABLE IF NOT EXISTS "TRAFFIC".collision_events AS (
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
            min(acc."ACCLOC") AS accloc,
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
    upper(btrim(a.stname1)) AS street_1,
    upper(btrim(a.streetype1)) AS street_type_1,
    upper(btrim(a.dir1)) AS direction_1,
    upper(btrim(a.stname2)) AS street_2,
    upper(btrim(a.streetype2)) AS street_type_2,
    upper(btrim(a.dir2)) AS direction_2,
    upper(btrim(a.stname3)) AS street_3,
    upper(btrim(a.streetype3)) AS street_type_3,
    upper(btrim(a.dir3)) AS direction_3,
    upper(btrim(d.description)) AS location_class,
    upper(btrim(b.description)) AS location_desc,
    upper(btrim(c.description)) AS collision_type,
    upper(btrim(e.description)) AS impact_type,
    upper(btrim(a.road_class)) AS road_class,
    upper(btrim(h.description)) AS visibility,
    upper(btrim(i.description)) AS light,
    upper(btrim(j.description)) AS road_surface_cond,
    a.longitude,
    a.latitude
   FROM col_events_raw a
     JOIN events_id_data z ON z.accnb::text = a.accnb::text AND z.accdate = a.accdate AND z.acctime::text = a.acctime::text
     LEFT JOIN collision_factors.loccoord b USING (loccoord)
     LEFT JOIN collision_factors.acclass c USING (acclass)
     LEFT JOIN collision_factors.accloc d USING (accloc)
     LEFT JOIN collision_factors.impactype e USING (impactype)
     LEFT JOIN collision_factors.visible h USING (visible)
     LEFT JOIN collision_factors.light i USING (light)
     LEFT JOIN collision_factors.rdsfcond j USING (rdsfcond)
  ORDER BY z.collision_id
); 