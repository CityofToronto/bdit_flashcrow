CREATE SCHEMA IF NOT EXISTS routing;

CREATE MATERIALIZED VIEW IF NOT EXISTS routing.centreline_vertices AS (
  SELECT
    int_id AS id,
    ST_Transform(
      MODE() WITHIN GROUP (ORDER BY geom),
      2952
    ) AS geom
  FROM gis.centreline_intersection
  GROUP BY int_id
);
CREATE UNIQUE INDEX IF NOT EXISTS centreline_vertices_id ON routing.centreline_vertices (id);
CREATE INDEX IF NOT EXISTS centreline_vertices_geom ON counts.centreline_intersection USING GIST (geom);

REFRESH MATERIALIZED VIEW routing.centreline_vertices;
