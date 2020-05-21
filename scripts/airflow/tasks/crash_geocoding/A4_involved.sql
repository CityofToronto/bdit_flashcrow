CREATE SCHEMA IF NOT EXISTS collisions;

CREATE MATERIALIZED VIEW IF NOT EXISTS collisions.involved AS (
  SELECT
    ifn.*,
    CASE
      WHEN ifn.drivact IN (2, 3, 4, 7, 8, 9)
        OR ifn.actual_speed > ifn.posted_speed THEN TRUE
      ELSE FALSE
    END AS aggressive,
    CASE
      WHEN ifn.invtype IN (4, 5, 8, 9) OR ifn.vehtype IN (3, 36) THEN TRUE
      ELSE FALSE
    END AS cyclist,
    CASE
      WHEN ifn.injury >= 3 THEN TRUE
      ELSE FALSE
    END AS ksi,
    CASE
      WHEN ifn.vehtype IN (2, 3)
        OR ifn.invtype IN (6, 7) THEN TRUE
      ELSE FALSE
    END AS motorcyclist,
    CASE
      WHEN ifn.invage >= 55 THEN TRUE
      ELSE FALSE
    END AS older_adult,
    CASE
      WHEN ifn.invtype IN (3, 17, 19) THEN TRUE
      ELSE FALSE
    END AS pedestrian,
    CASE
      WHEN efn.private_property THEN FALSE
      WHEN (ifn.event1 BETWEEN 50 AND 66)
        OR (ifn.event2 BETWEEN 50 AND 66)
        OR (ifn.event3 BETWEEN 50 AND 66) THEN TRUE
      ELSE FALSE
    END AS property_damage,
    CASE
      WHEN ifn.invage < 4 OR ifn.invage > 19 THEN FALSE
      WHEN date_part('DOW', efn.accdate) IN (0, 6) THEN FALSE
      WHEN date_part('MONTH', efn.accdate) IN (7, 8) THEN FALSE
      ELSE TRUE
    END AS school_child,
    CASE
      WHEN ifn.drivact IN (3, 4)
        OR ifn.actual_speed > ifn.posted_speed THEN TRUE
      ELSE FALSE
    END AS speeding
  FROM collisions.involved_fields_norm ifn
  JOIN collisions.events_fields_norm efn USING (collision_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS involved_id ON collisions.involved (id);
CREATE INDEX IF NOT EXISTS involved_collision_id ON collisions.involved (collision_id);

REFRESH MATERIALIZED VIEW CONCURRENTLY collisions.involved;
