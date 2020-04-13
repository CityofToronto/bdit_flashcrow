CREATE SCHEMA IF NOT EXISTS prj_volume_tmp;

CREATE MATERIALIZED VIEW IF NOT EXISTS prj_volume_tmp.nodes_corrected AS (
  SELECT
    "LINK_ID"::bigint AS link_id,
    ST_Transform(
      ST_Translate(
        ST_SetSRID(ST_Point("X_COORD", "Y_COORD"), 92019),
        -- Determined empirically by examining distributions of projection drift.
        -- See https://www.notion.so/bditto/Arterycode-Conflation-Spelunking-bc87f8cace6645f3bade59b84e84661e
        -- for more details.
        17.128 * cos(radians(90 - 69.018)),
        17.128 * sin(radians(90 - 69.018))
      ),
      4326
    ) AS geom
  FROM "TRAFFIC"."NODE"
);
CREATE UNIQUE INDEX IF NOT EXISTS nodes_corrected_link_id ON prj_volume_tmp.nodes_corrected (link_id);

REFRESH MATERIALIZED VIEW CONCURRENTLY prj_volume_tmp.nodes_corrected;

CREATE MATERIALIZED VIEW IF NOT EXISTS prj_volume_tmp.nodes_intersection AS (
  SELECT
    nc.link_id,
    COALESCE(u.int_id, ci.int_id) AS int_id,
    COALESCE(u.geom, ci.geom, nc.geom) AS geom
  FROM prj_volume_tmp.nodes_corrected nc
  LEFT JOIN prj_volume_tmp.centreline_intersection ci ON nc.link_id = ci.int_id
  LEFT JOIN LATERAL (
    SELECT
      int_id,
      geom,
      ST_Distance(ST_Transform(nc.geom, 2952), ST_Transform(geom, 2952)) AS geom_dist
    FROM prj_volume_tmp.centreline_intersection
    WHERE ST_DWithin(ST_Transform(nc.geom, 2952), ST_Transform(geom, 2952), 10)
    ORDER BY geom_dist ASC
    LIMIT 1
  ) u ON true
);
CREATE UNIQUE INDEX IF NOT EXISTS nodes_intersection_link_id ON prj_volume_tmp.nodes_intersection (link_id);
