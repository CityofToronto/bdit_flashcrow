CREATE SCHEMA IF NOT EXISTS counts;

CREATE MATERIALIZED VIEW IF NOT EXISTS counts.arteries_midblock_int_id AS (
  SELECT
    aml.arterycode,
    ni_from.int_id AS from_int_id,
    ni_to.int_id AS to_int_id,
    CASE
      WHEN ni_from.int_id IS NOT NULL AND ni_to.int_id IS NOT NULL THEN 2
      WHEN ni_from.int_id IS NOT NULL OR ni_to.int_id IS NOT NULL THEN 1
      ELSE 0
    END AS n
  FROM counts.arteries_midblock_link aml
  LEFT JOIN counts.nodes_intersection ni_from ON aml.from_link_id = ni_from.link_id
  LEFT JOIN counts.nodes_intersection ni_to ON aml.to_link_id = ni_to.link_id
);
CREATE UNIQUE INDEX IF NOT EXISTS arteries_midblock_int_id_arterycode ON counts.arteries_midblock_int_id (arterycode);

REFRESH MATERIALIZED VIEW CONCURRENTLY counts.arteries_midblock_int_id;
