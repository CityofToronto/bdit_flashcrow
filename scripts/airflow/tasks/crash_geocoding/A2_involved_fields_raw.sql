CREATE SCHEMA IF NOT EXISTS collisions;

CREATE MATERIALIZED VIEW IF NOT EXISTS collisions.involved_fields_raw AS (
  SELECT
    row_number() OVER (ORDER BY efr.collision_id, a."PER_NO") AS id,
    efr.collision_id,
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
    --CAST(NULL AS VARCHAR(35)) AS surname,
    --CAST(NULL AS VARCHAR(50)) AS given,
    --CAST(NULL AS VARCHAR(6)) AS str_number,
    --CAST(NULL AS VARCHAR(35)) AS street,
    --CAST(NULL AS VARCHAR(10)) AS type,
    --CAST(NULL AS VARCHAR(1)) AS dir,
    --CAST(NULL AS VARCHAR(6)) AS apt,
    --CAST(NULL AS VARCHAR(16)) AS city,
    --CAST(NULL AS VARCHAR(4)) AS prov,
    --a."POSTAL" AS postal,
    --a."BIRTHDATE" AS birthdate,
    --a."PERSON_ID" AS person_id,
    --
    a."FAILTOREM" AS failtorem,
    a."PEDTYPE" AS pedtype,
    a."CYCLISTYPE" AS cyclistype,
    a."CYCACT" AS cycact,
    a."CYCCOND" AS cyccond,
    a."FATAL_NO" AS fatal_no,
    a."ACTUAL_SPEED" AS actual_speed,
    a."POSTED_SPEED" AS posted_speed
  FROM "TRAFFIC"."ACC" a
  INNER JOIN collisions.events_fields_raw efr ON a."ACCDATE" = efr.accdate AND a."ACCNB" = efr.accnb
);
CREATE UNIQUE INDEX IF NOT EXISTS involved_fields_raw_id ON collisions.involved_fields_raw (id);

REFRESH MATERIALIZED VIEW CONCURRENTLY collisions.involved_fields_raw;
