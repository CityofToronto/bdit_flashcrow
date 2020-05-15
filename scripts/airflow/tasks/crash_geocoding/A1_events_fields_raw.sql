CREATE SCHEMA IF NOT EXISTS collisions;

CREATE MATERIALIZED VIEW IF NOT EXISTS collisions.events_fields_raw AS (
  WITH collisions_events_geom AS (
    SELECT
      row_number() OVER (ORDER BY "ACCDATE", "ACCNB") AS collision_id,
      "ACCNB" AS accnb,
      "ACCDATE" AS accdate,
      --max("DAY_NO") AS day_no,
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
      --max("BADGE_NO") AS badge_no,
      --max("XCOORD") AS xcoord,
      --max("YCOORD") AS ycoord,
      --max("PRECISE_XY") AS precise_xy,
      max("CHANGED") AS changed,
      --max("SENT_UNIT") AS sent_unit,
      --max("SENT_DATE") AS sent_date,
      --max("STATUS") AS status,
      --max("CITY_AREA") AS city_area,
      max("COMMENTS") AS comments,
      --max("MTP_DIVISION") AS mtp_division,
      --max("POLICE_AGENCY") AS police_agency,
      --max("SUBMIT_BADGE_NUMBER") AS submit_badge_number,
      --max("SUBMIT_DATE") AS submit_date,
      max("PRIVATE_PROPERTY") AS private_property,
      --max("USERID") AS userid,
      --max("TS") AS ts,
      min("ROAD_CLASS") AS road_class,
      --min("PX") AS px,
      --max("QUADRANT") AS quadrant,
      --max("YEAR") AS year,
      --max("REC_ID") AS rec_id,
      max("MVAIMG") AS mvaimg,
      max("DESCRIPTION") AS description,
      max("TRAFCTLCOND") AS trafctlcond,
      ST_Transform(
        ST_SetSRID(
          ST_MakePoint(max("LONGITUDE") + 0.000210, max("LATITUDE") + 0.000045),
          4269
        ),
        4326
      ) AS "geom"
    FROM "TRAFFIC"."ACC"
    WHERE "LONGITUDE" < 0 AND "LATITUDE" > 0
    GROUP BY "ACCDATE", "ACCNB"
  )
  SELECT
    *,
    ST_X(geom) AS longitude,
    ST_Y(geom) AS latitude
  FROM collisions_events_geom
);
CREATE UNIQUE INDEX IF NOT EXISTS events_fields_raw_collision_id ON collisions.events_fields_raw (collision_id);

REFRESH MATERIALIZED VIEW CONCURRENTLY collisions.events_fields_raw;
