CREATE SCHEMA IF NOT EXISTS counts;

CREATE MATERIALIZED VIEW IF NOT EXISTS counts.nodes_corrected AS (
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
CREATE UNIQUE INDEX IF NOT EXISTS nodes_corrected_link_id ON counts.nodes_corrected (link_id);
CREATE INDEX IF NOT EXISTS nodes_corrected_srid2952_geom ON counts.nodes_corrected USING gist (ST_Transform(geom, 2952));

REFRESH MATERIALIZED VIEW CONCURRENTLY counts.nodes_corrected;
