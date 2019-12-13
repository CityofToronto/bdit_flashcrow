COPY (
WITH event_injury AS (
  SELECT i.collision_id, MAX(CONCAT('0', i.injury)::int) AS injury
  FROM collisions.events e
  JOIN collisions.involved i ON e.collision_id = i.collision_id
  WHERE e.accdate >= now() - interval '1 year'
  GROUP BY i.collision_id
),
collisions AS (
  SELECT
    ei.collision_id, ei.injury,
    e.geom, e.accnb, e.accdate, e.acctime,
    ec.centreline_id, ec.centreline_type
  FROM event_injury ei
  JOIN collisions.events e ON ei.collision_id = e.collision_id
  JOIN collisions.events_centreline ec ON ei.collision_id = ec.collision_id
),
geojson_features AS (
  SELECT jsonb_build_object(
    'type', 'Feature',
    'id', collision_id,
    'geometry', ST_AsGeoJSON(geom)::jsonb,
    'properties', to_jsonb(collisions.*) - 'collision_id' - 'geom'
  ) AS feature
  FROM collisions
)
SELECT jsonb_build_object(
  'type', 'FeatureCollection',
  'features', jsonb_agg(feature)
) AS feature_collection
FROM geojson_features
) TO STDOUT WITH (HEADER FALSE);
