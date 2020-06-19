CREATE SCHEMA IF NOT EXISTS location_search;

CREATE MATERIALIZED VIEW IF NOT EXISTS location_search.traffic_signal AS (
  SELECT
    ts.px,
    2 AS centreline_type,
    u.int_id AS centreline_id
  FROM
  (SELECT px::smallint AS px, geom FROM gis.traffic_signal) ts
  INNER JOIN LATERAL
  (
    SELECT
      int_id,
      ST_Distance(
        ST_Transform(geom, 2952),
        ST_Transform(ts.geom, 2952)
      ) AS geom_dist
    FROM gis.centreline_intersection
    WHERE ST_DWithin(
      ST_Transform(geom, 2952),
      ST_Transform(ts.geom, 2952),
      30
    )
    ORDER BY geom_dist ASC
    LIMIT 1
  ) u ON true
);
CREATE UNIQUE INDEX IF NOT EXISTS ls_traffic_signal_px ON location_search.traffic_signal (px);

REFRESH MATERIALIZED VIEW CONCURRENTLY location_search.traffic_signal;
