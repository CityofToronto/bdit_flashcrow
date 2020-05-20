CREATE SCHEMA IF NOT EXISTS collisions;

CREATE MATERIALIZED VIEW IF NOT EXISTS collisions.involved_fields_norm AS (
  SELECT
    id,
    collision_id,
    CASE WHEN veh_no IS NULL OR trim(veh_no) = '' THEN NULL ELSE veh_no::smallint END AS veh_no,
    CASE WHEN vehtype IS NULL OR trim(vehtype) = '' THEN NULL ELSE vehtype::smallint END AS vehtype,
    CASE WHEN initdir IS NULL OR trim(initdir) = '' THEN NULL ELSE initdir::smallint END AS initdir,
    CASE WHEN imploc IS NULL OR trim(imploc) = '' THEN NULL ELSE imploc::smallint END AS imploc,
    CASE WHEN event1 IS NULL OR trim(event1) = '' THEN NULL ELSE event1::smallint END AS event1,
    CASE WHEN event2 IS NULL OR trim(event2) = '' THEN NULL ELSE event2::smallint END AS event2,
    CASE WHEN event3 IS NULL OR trim(event3) = '' THEN NULL ELSE event3::smallint END AS event3,
    CASE WHEN per_no IS NULL OR trim(per_no) = '' THEN NULL ELSE per_no::smallint END AS per_no,
    CASE WHEN invtype IS NULL OR trim(invtype) = '' THEN NULL ELSE invtype::smallint END AS invtype,
    CASE
      WHEN invage IS NULL OR trim(invage) = '' THEN NULL
      WHEN lower(invage) = 'uk' THEN NULL
      ELSE invage::smallint
    END AS invage,
    CASE WHEN injury IS NULL OR trim(injury) = '' THEN NULL ELSE injury::smallint END AS injury,
    CASE
      WHEN safequip IS NULL OR trim(safequip) = '' THEN NULL
      WHEN lower(safequip) = 'ch' THEN NULL
      ELSE safequip::smallint
    END AS safequip,
    CASE WHEN drivact IS NULL OR trim(drivact) = '' THEN NULL ELSE drivact::smallint END AS drivact,
    CASE WHEN drivcond IS NULL OR trim(drivcond) = '' THEN NULL ELSE drivcond::smallint END AS drivcond,
    CASE WHEN pedcond IS NULL OR trim(pedcond) = '' THEN NULL ELSE pedcond::smallint END AS pedcond,
    CASE WHEN pedact IS NULL OR trim(pedact) = '' THEN NULL ELSE pedact::smallint END AS pedact,
    charge,
    charge2,
    charge3,
    charge4,
    CASE
      WHEN manoeuver IS NULL OR trim(manoeuver) = '' THEN NULL
      WHEN lower(manoeuver) = 'na' THEN NULL
      ELSE manoeuver::smallint
    END AS manoeuver,
    CASE WHEN failtorem = '1' THEN TRUE ELSE FALSE END AS failtorem,
    CASE WHEN pedtype IS NULL OR trim(pedtype) = '' THEN NULL ELSE pedtype::smallint END AS pedtype,
    CASE WHEN cyclistype IS NULL OR trim(cyclistype) = '' THEN NULL ELSE cyclistype::smallint END AS cyclistype,
    CASE WHEN cycact IS NULL OR trim(cycact) = '' THEN NULL ELSE cycact::smallint END AS cycact,
    CASE WHEN cyccond IS NULL OR trim(cyccond) = '' THEN NULL ELSE cyccond::smallint END AS cyccond,
    fatal_no::smallint,
    actual_speed,
    posted_speed
  FROM collisions.involved_fields_raw
);
CREATE UNIQUE INDEX IF NOT EXISTS involved_fields_norm_id ON collisions.involved_fields_norm (id);
CREATE INDEX IF NOT EXISTS involved_fields_norm_collision_id ON collisions.involved_fields_norm (collision_id);

REFRESH MATERIALIZED VIEW CONCURRENTLY collisions.involved_fields_norm;
