COPY (
WITH event_injury AS (
  SELECT i.collision_id, max(i.injury) AS injury
  FROM collisions.events e
  JOIN collisions.involved i ON e.collision_id = i.collision_id
  WHERE e.accdate >= now() - interval :datesFromInterval
  GROUP BY i.collision_id
),
features AS (
  SELECT
    ei.collision_id AS "id",
    e.geom,
    ei.injury,
    CASE
      WHEN ei.injury = 4 THEN 10
      WHEN ei.injury = 3 THEN 3
      WHEN ei.injury = 2 THEN 0.3
      ELSE 0.03
    END AS heatmap_weight
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
