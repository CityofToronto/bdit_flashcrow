CREATE SCHEMA IF NOT EXISTS collisions;

CREATE MATERIALIZED VIEW IF NOT EXISTS collisions.events AS (
  WITH involved_vision_zero AS (
    SELECT
      collision_id,
      count(*) FILTER (
        WHERE drivact IN (2, 3, 4, 7, 8, 9)
        OR actual_speed > posted_speed
      ) AS aggressive,
      count(*) FILTER (WHERE invage >= 4 AND invage <= 19) AS child,
      count(*) FILTER (
        WHERE invtype IN (4, 5, 8, 9)
        OR vehtype IN (3, 36)
      ) AS cyclist,
      count(*) FILTER (WHERE injury >= 3) AS ksi,
      count(*) FILTER (
        WHERE vehtype IN (2, 3)
        OR invtype IN (6, 7)
      ) AS motorcyclist,
      count(*) FILTER (WHERE invage >= 55) AS older_adult,
      count(*) FILTER (
        WHERE invtype IN (3, 17, 19)
      ) AS pedestrian,
      count(*) FILTER (
        WHERE (event1 BETWEEN 50 AND 66)
        OR (event2 BETWEEN 50 AND 66)
        OR (event3 BETWEEN 50 AND 66)
      ) AS property_damage,
      count(*) FILTER (
        WHERE drivact IN (3, 4)
        OR actual_speed > posted_speed
      ) AS speeding
    FROM collisions.involved
    GROUP BY collision_id
  )
  SELECT
    efn.*,
    CASE WHEN ivz.aggressive > 0 THEN TRUE ELSE FALSE END AS aggressive,
    CASE WHEN ivz.cyclist > 0 THEN TRUE ELSE FALSE END AS cyclist,
    CASE WHEN ivz.ksi > 0 THEN TRUE ELSE FALSE END AS ksi,
    CASE WHEN ivz.motorcyclist > 0 THEN TRUE ELSE FALSE END AS motorcyclist,
    CASE WHEN ivz.older_adult > 0 THEN TRUE ELSE FALSE END AS older_adult,
    CASE WHEN ivz.pedestrian > 0 THEN TRUE ELSE FALSE END AS pedestrian,
    -- for property damage, filter to public property and check for property damage in comments
    CASE
      WHEN efn.private_property THEN FALSE
      WHEN ivz.property_damage > 0 THEN TRUE
      WHEN efn.comments LIKE '%Property Damage:%' THEN TRUE
      ELSE FALSE
    END AS property_damage,
    -- for schoolchildren, filter (roughly) to school days
    CASE
      WHEN ivz.child = 0 THEN FALSE
      WHEN date_part('DOW', efn.accdate) IN (0, 6) THEN FALSE
      WHEN date_part('MONTH', efn.accdate) IN (7, 8) THEN FALSE
      ELSE TRUE
    END AS school_child,
    CASE WHEN ivz.speeding > 0 THEN TRUE ELSE FALSE END AS speeding
  FROM collisions.events_fields_norm efn
  JOIN involved_vision_zero ivz USING (collision_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS events_collision_id ON collisions.events (collision_id);
CREATE INDEX IF NOT EXISTS events_accdate ON collisions.events (accdate);
CREATE INDEX IF NOT EXISTS events_geom ON collisions.events USING GIST (geom);
CREATE INDEX IF NOT EXISTS events_srid3857_geom ON collisions.events USING GIST (ST_Transform(geom, 3857));
CREATE INDEX IF NOT EXISTS events_srid2952_geom ON collisions.events USING GIST (ST_Transform(geom, 2952));

REFRESH MATERIALIZED VIEW CONCURRENTLY collisions.events;
