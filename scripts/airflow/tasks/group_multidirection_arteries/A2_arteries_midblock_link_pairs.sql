CREATE SCHEMA IF NOT EXISTS counts;

CREATE MATERIALIZED VIEW IF NOT EXISTS counts.arteries_midblock_link_pairs AS (
  WITH a AS (
    SELECT
      aml1.arterycode AS arterycode1,
      aml2.arterycode AS arterycode2,
      LEAST(aml1.from_link_id, aml1.to_link_id) AS from_link_id,
      GREATEST(aml1.from_link_id, aml1.to_link_id) AS to_link_id,
      am1.geo_id AS geo_id,
      am1.geom AS geom
    FROM counts.arteries_midblock_link aml1
    JOIN counts.arteries_midblock am1 ON aml1.arterycode = am1.arterycode
    JOIN counts.arteries_midblock_link aml2 ON aml1.from_link_id = aml2.to_link_id AND aml1.to_link_id = aml2.from_link_id
    JOIN counts.arteries_midblock am2 ON aml2.arterycode = am2.arterycode
    WHERE aml1.arterycode < aml2.arterycode
    AND am1.geo_id IS NOT NULL
    AND am2.geo_id IS NOT NULL
    AND am1.geo_id = am2.geo_id
  ), b AS (
    SELECT from_link_id, to_link_id, COUNT(*) AS n
    FROM a
    GROUP BY from_link_id, to_link_id
  )
  SELECT a.arterycode1, a.arterycode2, a.geo_id, a.geom
  FROM a
  JOIN b USING (from_link_id, to_link_id)
  WHERE b.n = 1
);
CREATE UNIQUE INDEX IF NOT EXISTS arteries_midblock_link_pairs_arterycode1 ON counts.arteries_midblock_link_pairs (arterycode1);

REFRESH MATERIALIZED VIEW CONCURRENTLY counts.arteries_midblock_link_pairs;
