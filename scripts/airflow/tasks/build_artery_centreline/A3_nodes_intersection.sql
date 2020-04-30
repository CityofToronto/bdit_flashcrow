CREATE SCHEMA IF NOT EXISTS prj_volume_tmp;

CREATE MATERIALIZED VIEW IF NOT EXISTS prj_volume_tmp.nodes_intersection AS (
  SELECT
    nc.link_id,
    COALESCE(ci.int_id, u.int_id) AS int_id,
    COALESCE(ci.geom, u.geom, nc.geom) AS geom
  FROM prj_volume_tmp.nodes_corrected nc
  LEFT JOIN prj_volume_tmp.centreline_intersection ci ON nc.link_id = ci.int_id
  LEFT JOIN LATERAL (
    SELECT
      int_id,
      geom,
      ST_Distance(ST_Transform(nc.geom, 2952), ST_Transform(geom, 2952)) AS geom_dist
    FROM prj_volume_tmp.centreline_intersection
    WHERE ST_DWithin(ST_Transform(nc.geom, 2952), ST_Transform(geom, 2952), 5)
    ORDER BY geom_dist ASC
    LIMIT 1
  ) u ON true
);
CREATE UNIQUE INDEX IF NOT EXISTS nodes_intersection_link_id ON prj_volume_tmp.nodes_intersection (link_id);
CREATE INDEX IF NOT EXISTS nodes_intersection_srid2952_geom ON prj_volume_tmp.nodes_intersection USING gist (ST_Transform(geom, 2952));
