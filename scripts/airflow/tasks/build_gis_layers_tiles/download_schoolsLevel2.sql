COPY (
WITH schools AS (
  SELECT objectid, geom, name, school_type AS "schoolType"
  FROM gis.school
),
geojson_features AS (
  SELECT jsonb_build_object(
    'type', 'Feature',
    'id', objectid,
    'geometry', ST_AsGeoJSON(geom)::jsonb,
    'properties', to_jsonb(schools.*) - 'objectid' - 'geom'
  ) AS feature
  FROM schools
)
SELECT jsonb_build_object(
  'type', 'FeatureCollection',
  'features', jsonb_agg(feature)
) AS feature_collection
FROM geojson_features
) TO STDOUT WITH (HEADER FALSE);
