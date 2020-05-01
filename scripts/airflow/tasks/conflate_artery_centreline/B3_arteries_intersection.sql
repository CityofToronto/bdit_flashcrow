CREATE SCHEMA IF NOT EXISTS counts;
CREATE SCHEMA IF NOT EXISTS counts_new;

CREATE TABLE IF NOT EXISTS counts_new.arteries_intersection (
  SELECT
    al.arterycode,
    al.link_id,
    ni.int_id,
    ni.geom
  FROM artery_links al
  JOIN prj_volume_tmp.nodes_intersection ni USING (link_id)
)

-- Update double-buffered view.
CREATE MATERIALIZED VIEW IF NOT EXISTS counts.arteries_intersection AS
  SELECT * FROM counts_new.arteries_intersection;
CREATE UNIQUE INDEX IF NOT EXISTS arteries_intersection_arterycode ON counts.arteries_intersection (arterycode);

REFRESH MATERIALIZED VIEW CONCURRENTLY counts.arteries_intersection;
