CREATE SCHEMA IF NOT EXISTS collisions;

CREATE MATERIALIZED VIEW IF NOT EXISTS collisions.events AS (
  WITH involved_vision_zero AS (
    SELECT
      collision_id,
      count(*) FILTER (WHERE aggressive) AS aggressive,
      count(*) FILTER (WHERE cyclist) AS cyclist,
      count(*) FILTER (WHERE ksi) AS ksi,
      count(*) FILTER (WHERE motorcyclist) AS motorcyclist,
      count(*) FILTER (WHERE older_adult) AS older_adult,
      count(*) FILTER (WHERE pedestrian) AS pedestrian,
      count(*) FILTER (WHERE property_damage) AS property_damage,
      count(*) FILTER (WHERE school_child) AS school_child,
      count(*) FILTER (WHERE speeding) AS speeding
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
    CASE
      WHEN ivz.property_damage > 0 THEN TRUE
      WHEN efn.comments LIKE '%Property Damage:%' THEN TRUE
      ELSE FALSE
    END AS property_damage,
    CASE WHEN ivz.school_child > 0 THEN TRUE ELSE FALSE END AS school_child,
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
