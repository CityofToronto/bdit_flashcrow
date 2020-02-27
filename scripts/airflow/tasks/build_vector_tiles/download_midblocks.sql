COPY (
WITH features AS (
  SELECT
    gid AS "id",
    geom,
    geo_id AS "centrelineId",
    1 AS "centrelineType",
    lf_name AS "name",
    fcode AS "featureCode"
  FROM gis.centreline
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
