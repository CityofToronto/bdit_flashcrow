CREATE SCHEMA IF NOT EXISTS collisions;

CREATE MATERIALIZED VIEW IF NOT EXISTS collisions.events_fields_norm AS (
  SELECT
    collision_id,
    accnb,
    accdate + format('%s hours %s minutes', acctime::int / 100, acctime::int % 100)::interval AS accdate,
    stname1,
    streetype1,
    dir1,
    stname2,
    streetype2,
    dir2,
    stname3,
    streetype3,
    dir3,
    CASE WHEN municipal IS NULL OR trim(municipal) = '' THEN NULL ELSE municipal::smallint END AS municipal,
    CASE WHEN acclass IS NULL OR trim(acclass) = '' THEN NULL ELSE acclass::smallint END AS acclass,
    CASE WHEN accloc IS NULL OR trim(accloc) = '' THEN NULL ELSE accloc::smallint END AS accloc,
    CASE WHEN traffictl IS NULL OR trim(traffictl) = '' THEN NULL ELSE traffictl::smallint END AS traffictl,
    CASE WHEN visible IS NULL OR visible = '?' OR trim(visible) = '' THEN NULL ELSE visible::smallint END AS visible,
    CASE WHEN light IS NULL OR trim(light) = '' THEN NULL ELSE light::smallint END AS light,
    CASE WHEN rdsfcond IS NULL OR trim(rdsfcond) = '' THEN NULL ELSE rdsfcond::smallint END AS rdsfcond,
    changed,
    CASE WHEN private_property = 'Y' THEN TRUE ELSE FALSE END AS private_property,
    CASE WHEN road_class IS NULL OR trim(road_class) = '' THEN NULL ELSE road_class END AS road_class,
    mvaimg,
    description,
    CASE WHEN trafctlcond IS NULL OR trim(trafctlcond) = '' THEN NULL ELSE trafctlcond::smallint END AS trafctlcond,
    geom,
    longitude,
    latitude
  FROM collisions.events_fields_raw
);
CREATE UNIQUE INDEX IF NOT EXISTS events_fields_norm_collision_id ON collisions.events_fields_norm (collision_id);

REFRESH MATERIALIZED VIEW CONCURRENTLY collisions.events_fields_norm;
