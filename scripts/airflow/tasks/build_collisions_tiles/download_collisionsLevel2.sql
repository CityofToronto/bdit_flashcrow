COPY (
WITH event_injury AS (
  SELECT i.collision_id, MAX(CONCAT('0', i.injury)::int) AS injury
  FROM collisions.events e
  JOIN collisions.involved i ON e.collision_id = i.collision_id
  WHERE e.accdate >= now() - interval '1 year'
  GROUP BY i.collision_id
),
features AS (
  SELECT
    ei.collision_id AS "id",
    e.geom,
    ei.injury
  FROM event_injury ei
  JOIN collisions.events e ON ei.collision_id = e.collision_id
  JOIN collisions.events_centreline ec ON ei.collision_id = ec.collision_id
),
geojson_features AS (
  SELECT jsonb_build_object(
    'type', 'Feature',
    'id', id,
    'geometry', ST_AsGeoJSON(geom)::jsonb,
    'properties', to_jsonb(features.*) - 'id' - 'geom'
  ) AS feature
  FROM features
)
SELECT jsonb_build_object(
  'type', 'FeatureCollection',
  'features', jsonb_agg(feature)
) AS feature_collection
FROM geojson_features
) TO STDOUT WITH (HEADER FALSE);
