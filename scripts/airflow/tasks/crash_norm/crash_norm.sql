CREATE SCHEMA IF NOT EXISTS collisions_new;

DROP TABLE IF EXISTS collisions_new.events;
CREATE TABLE collisions_new.events AS (
  SELECT
    row_number() OVER (ORDER BY "ACCDATE", "ACCNB") AS collision_id,
    "ACCNB" AS accnb,
    "ACCDATE" AS accdate,
    max("DAY_NO") AS day_no,
    max("ACCTIME") AS acctime,
    max("STNAME1") AS stname1,
    max("STREETYPE1") AS streetype1,
    max("DIR1") AS dir1,
    max("STNAME2") AS stname2,
    max("STREETYPE2") AS streetype2,
    max("DIR2") AS dir2,
    max("STNAME3") AS stname3,
    max("STREETYPE3") AS streetype3,
    max("DIR3") AS dir3,
    max("MUNICIPAL") AS municipal,
    min("ACCLASS") AS acclass,
    min("ACCLOC") AS accloc,
    max("TRAFFICTL") AS traffictl,
    max("VISIBLE") AS visible,
    max("LIGHT") AS light,
    max("RDSFCOND") AS rdsfcond,
    max("BADGE_NO") AS badge_no,
    max("XCOORD") AS xcoord,
    max("YCOORD") AS ycoord,
    max("PRECISE_XY") AS precise_xy,
    max("LONGITUDE") AS longitude,
    max("LATITUDE") AS latitude,
    max("CHANGED") AS changed,
    max("SENT_UNIT") AS sent_unit,
    max("SENT_DATE") AS sent_date,
    max("STATUS") AS status,
    max("CITY_AREA") AS city_area,
    max("COMMENTS") AS comments,
    max("MTP_DIVISION") AS mtp_division,
    max("POLICE_AGENCY") AS police_agency,
    max("SUBMIT_BADGE_NUMBER") AS submit_badge_number,
    max("SUBMIT_DATE") AS submit_date,
    max("PRIVATE_PROPERTY") AS private_property,
    max("USERID") AS userid,
    max("TS") AS ts,
    min("ROAD_CLASS") AS road_class,
    min("PX") AS px,
    max("QUADRANT") AS quadrant,
    max("YEAR") AS year,
    max("REC_ID") AS rec_id,
    max("MVAIMG") AS mvaimg,
    max("DESCRIPTION") AS description,
    max("TRAFCTLCOND") AS trafctlcond,
    ST_SetSRID(ST_MakePoint(max("LONGITUDE"), max("LATITUDE")), 4326) AS geom
    FROM "TRAFFIC"."ACC"
    GROUP BY "ACCDATE", "ACCNB"
);
CREATE UNIQUE INDEX events_collision_id ON collisions_new.events (collision_id);
CREATE INDEX events_accdate ON collisions_new.events (accdate);
CREATE INDEX events_geom ON collisions_new.events USING GIST (geom);
CREATE INDEX events_srid3857_geom ON collisions_new.events USING GIST (ST_Transform(geom, 3857));

DROP TABLE IF EXISTS collisions_new.involved;
CREATE TABLE collisions_new.involved AS (
  SELECT
    e.collision_id,
    a."VEH_NO" AS veh_no,
    a."VEHTYPE" AS vehtype,
    a."IMPLOC" AS imploc,
    a."EVENT1" AS event1,
    a."EVENT2" AS event2,
    a."EVENT3" AS event3,
    a."PER_NO" AS per_no,
    a."INVTYPE" AS invtype,
    a."INVAGE" AS invage,
    a."INJURY" AS injury,
    a."SAFEQUIP" AS safequip,
    a."DRIVACT" AS drivact,
    a."DRIVCOND" AS drivcond,
    a."PEDCOND" AS pedcond,
    a."PEDACT" AS pedact,
    a."CHARGE" AS charge,
    a."CHARGE2" AS charge2,
    a."CHARGE3" AS charge3,
    a."CHARGE4" AS charge4,
    a."MANOEUVER" AS manoeuver,
    -- These columns are currently excluded from replication.
    -- TODO: add these back in when we change that
    CAST(NULL AS VARCHAR(35)) AS surname,
    CAST(NULL AS VARCHAR(50)) AS given,
    CAST(NULL AS VARCHAR(6)) AS str_number,
    CAST(NULL AS VARCHAR(35)) AS street,
    CAST(NULL AS VARCHAR(10)) AS type,
    CAST(NULL AS VARCHAR(1)) AS dir,
    CAST(NULL AS VARCHAR(6)) AS apt,
    CAST(NULL AS VARCHAR(16)) AS city,
    CAST(NULL AS VARCHAR(4)) AS prov,
    a."POSTAL" AS postal,
    a."BIRTHDATE" AS birthdate,
    a."PERSON_ID" AS person_id,
    a."FAILTOREM" AS failtorem,
    a."PEDTYPE" AS pedtype,
    a."CYCLISTYPE" AS cyclistype,
    a."CYCACT" AS cycact,
    a."CYCCOND" AS cyccond,
    a."FATAL_NO" AS fatal_no,
    a."ACTUAL_SPEED" AS actual_speed,
    a."POSTED_SPEED" AS posted_speed
  FROM "TRAFFIC"."ACC" a JOIN collisions_new.events AS e ON a."ACCDATE" = e.accdate AND a."ACCNB" = e.accnb
);
CREATE INDEX involved_collision_id ON collisions_new.involved (collision_id);
