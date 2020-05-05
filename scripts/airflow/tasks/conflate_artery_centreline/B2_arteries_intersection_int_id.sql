CREATE SCHEMA IF NOT EXISTS counts;

CREATE MATERIALIZED VIEW IF NOT EXISTS counts.arteries_intersection_int_id AS (
  SELECT ail.arterycode, ni.int_id, ni.geom
  FROM counts.arteries_intersection_link ail
  JOIN counts.nodes_intersection ni USING (link_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS arteries_intersection_int_id_arterycode ON counts.arteries_intersection_int_id (arterycode);

REFRESH MATERIALIZED VIEW CONCURRENTLY counts.arteries_intersection_int_id;
