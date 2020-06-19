COPY (
WITH features AS (
  SELECT
    gid AS "id",
    geom,
    int_id AS "centrelineId",
    2 AS "centrelineType",
    intersec5 AS "name",
    elevatio9 AS "featureCode"
  FROM gis.centreline_intersection
  WHERE elevatio9 != 0
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
