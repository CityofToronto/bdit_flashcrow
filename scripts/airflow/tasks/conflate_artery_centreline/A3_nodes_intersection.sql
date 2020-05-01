CREATE SCHEMA IF NOT EXISTS counts;
CREATE SCHEMA IF NOT EXISTS counts_new;

CREATE TABLE IF NOT EXISTS counts_new.nodes_intersection (
  link_id BIGINT NOT NULL,
  geom GEOMETRY(POINT, 4326) NOT NULL,
  match_on_case SMALLINT,
  int_id BIGINT
);
CREATE UNIQUE INDEX IF NOT EXISTS nodes_intersection_link_id ON counts_new.nodes_intersection (link_id);

TRUNCATE TABLE counts_new.nodes_intersection;

-- Case 1: link ID matches intersection ID
INSERT INTO counts_new.nodes_intersection (
  SELECT nc.link_id, ci.geom, 1 AS match_on_case, ci.int_id
  FROM counts.nodes_corrected nc
  JOIN counts.centreline_intersection ci ON nc.link_id = ci.int_id
);

-- Case 2: corrected node geometry has close spatial match to intersection geometry
INSERT INTO counts_new.nodes_intersection (
  SELECT nc.link_id, ci.geom, 2 AS match_on_case, ci.int_id
  FROM counts.nodes_corrected nc
  LEFT JOIN counts_new.nodes_intersection ni USING (link_id)
  JOIN LATERAL (
    SELECT
      int_id,
      geom,
      ST_Distance(ST_Transform(nc.geom, 2952), ST_Transform(geom, 2952)) AS geom_dist
    FROM counts.centreline_intersection
    WHERE ST_DWithin(ST_Transform(nc.geom, 2952), ST_Transform(geom, 2952), 5)
    ORDER BY geom_dist ASC
    LIMIT 1
  ) ci ON true
  WHERE ni.link_id IS NULL
);

-- Case 3: fail to match; keep corrected node geometry, but leave intersection ID as NULL
INSERT INTO counts_new.nodes_intersection (
  SELECT nc.link_id, nc.geom, 3 AS match_on_case, NULL AS int_id
  FROM counts.nodes_corrected nc
  LEFT JOIN counts_new.nodes_intersection ni USING (link_id)
  WHERE ni.link_id IS NULL
);

-- Update double-buffered view.
CREATE MATERIALIZED VIEW IF NOT EXISTS counts.nodes_intersection AS
  SELECT * FROM counts_new.nodes_intersection;
CREATE UNIQUE INDEX IF NOT EXISTS nodes_intersection_link_id ON counts.nodes_intersection (link_id);
CREATE INDEX IF NOT EXISTS nodes_intersection_srid2952_geom ON counts.nodes_intersection USING gist (ST_Transform(geom, 2952));

REFRESH MATERIALIZED VIEW CONCURRENTLY counts.nodes_intersection;
