CREATE SCHEMA IF NOT EXISTS counts;

CREATE MATERIALIZED VIEW IF NOT EXISTS counts.arteries_intersection_link AS (
  SELECT
    "ARTERYCODE" AS arterycode,
    "LINKID"::bigint AS link_id
  FROM "TRAFFIC"."ARTERYDATA"
  WHERE "LINKID" NOT LIKE '%@%'
);
CREATE UNIQUE INDEX IF NOT EXISTS arteries_intersection_link_arterycode ON counts.arteries_intersection_link (arterycode);

REFRESH MATERIALIZED VIEW CONCURRENTLY counts.arteries_intersection_link;

-- Slightly modified version of conflation process by Aakash; see comments inline
CREATE MATERIALIZED VIEW IF NOT EXISTS counts.arteries_intersection_manual_corr AS (
  WITH ind AS (
    -- The old conflation process only output midblocks, which meant that it had to represent
    -- intersections using all midblocks incident on that intersection.
    --
    -- Given a series of such `(arterycode, geo_id)` pairs, this next part ranks all
    -- `int_id` candidates by how many such incident segments have that intersection
    -- as one of their endpoints.
    SELECT
      x.arterycode,
      x.int_id,
      sum(x.num_points) AS total_points
    FROM (
      SELECT
        amc.arterycode,
        c_1.fnode AS int_id,
        count(1) AS num_points
      FROM counts.arteries_manual_corr amc
      JOIN counts.arteries_intersection_link ail USING (arterycode)
      JOIN gis.centreline c_1 ON amc.centreline_id = c_1.geo_id
      GROUP BY amc.arterycode, c_1.fnode
    UNION ALL
      SELECT
        amc.arterycode,
        c_1.tnode AS int_id,
        count(1) AS num_points
      FROM counts.arteries_manual_corr amc
      JOIN counts.arteries_intersection_link ail USING (arterycode)
      JOIN gis.centreline c_1 ON amc.centreline_id = c_1.geo_id
      GROUP BY amc.arterycode, c_1.tnode
    ) x
    GROUP BY x.arterycode, x.int_id
    ORDER BY x.arterycode
  ), initial AS (
    SELECT
      a_1.arterycode,
      a_1.int_id,
      CASE
        WHEN f.px IS NOT NULL THEN 1::double precision
        ELSE a_1.int_id
      END AS ranking
    FROM ind a_1
    -- Pick the highest-ranked `int_id` from `ind` above.
    JOIN (
      SELECT
        ind.arterycode,
        max(ind.total_points) AS max_points
      FROM ind
      GROUP BY ind.arterycode
    ) b_1 ON a_1.arterycode = b_1.arterycode AND b_1.max_points = a_1.total_points
    LEFT JOIN (
      SELECT
        "ARTERYCODE" AS arterycode,
        (regexp_matches("LOCATION"::text, 'PX (\d+)'::text))[1] AS px
      FROM "TRAFFIC"."ARTERYDATA"
    ) c ON a_1.arterycode = c.arterycode
    LEFT JOIN (
      SELECT
        "ARTERYCODE" AS arterycode,
        "LOCATION" AS location
      FROM "TRAFFIC"."ARTERYDATA"
    ) d ON a_1.arterycode = d.arterycode
    LEFT JOIN gis.centreline_intersection e USING (int_id)
    LEFT JOIN gis.traffic_signal f ON e.int_id = f.node_id AND f.node_id <> 0 AND c.px = f.px
    ORDER BY a_1.arterycode
  )
  SELECT a.arterycode, a.int_id
  FROM initial a
  JOIN (
    SELECT
      initial.arterycode,
      min(initial.ranking) AS ranking
    FROM initial
    GROUP BY initial.arterycode
  ) b USING (arterycode, ranking)
  GROUP BY a.arterycode, a.int_id
);
CREATE UNIQUE INDEX IF NOT EXISTS arteries_intersection_manual_corr_arterycode ON counts.arteries_intersection_manual_corr (arterycode);

REFRESH MATERIALIZED VIEW CONCURRENTLY counts.arteries_intersection_manual_corr;
