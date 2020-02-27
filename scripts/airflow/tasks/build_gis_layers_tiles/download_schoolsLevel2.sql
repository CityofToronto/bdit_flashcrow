COPY (
WITH features AS (
  SELECT
    objectid AS "id",
    geom,
    name,
    school_type AS "schoolType"
  FROM gis.school
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
