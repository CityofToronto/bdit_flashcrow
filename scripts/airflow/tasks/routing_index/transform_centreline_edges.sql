CREATE SCHEMA IF NOT EXISTS routing;

CREATE MATERIALIZED VIEW IF NOT EXISTS routing.centreline_edges AS (
  SELECT
    geo_id::int AS id,
    fnode::int AS source,
    tnode::int AS target,
    ST_Length(ST_Transform(c.geom, 2952)) AS cost,
    -1 AS reverse_cost,
    ST_X(vf.geom) AS x1,
    ST_Y(vf.geom) AS y1,
    ST_X(vt.geom) AS x2,
    ST_Y(vt.geom) AS y2
  FROM gis.centreline c
  JOIN routing.centreline_vertices vf ON c.fnode = vf.id
  JOIN routing.centreline_vertices vt ON c.tnode = vt.id
);
CREATE UNIQUE INDEX IF NOT EXISTS centreline_edges_id ON routing.centreline_edges (id);
CREATE INDEX IF NOT EXISTS centreline_edges_source ON routing.centreline_edges (source);
CREATE INDEX IF NOT EXISTS centreline_edges_target ON routing.centreline_edges (target);

REFRESH MATERIALIZED VIEW routing.centreline_edges;
