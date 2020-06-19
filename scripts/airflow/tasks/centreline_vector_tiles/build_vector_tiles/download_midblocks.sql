COPY (
WITH features AS (
  SELECT
    gc.gid AS "id",
    gc.geom,
    gc.geo_id AS "centrelineId",
    1 AS "centrelineType",
    gc.lf_name AS "name",
    gc.fcode AS "featureCode",
    va.aadt
  FROM gis.centreline gc
  LEFT JOIN volume.aadt va ON gc.geo_id = va.centreline_id
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
