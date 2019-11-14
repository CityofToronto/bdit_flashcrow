DROP TABLE IF EXISTS prj_volume.artery_intersections;
CREATE TABLE prj_volume.artery_intersections AS (
  WITH initial AS (
    WITH ind AS (
      SELECT
        x.arterycode,
        x.int_id,
        sum(x.num_points) AS total_points
      FROM (
        SELECT
          a_2.arterycode,
          c_1.fnode AS int_id,
          count(1) AS num_points
        FROM prj_volume.artery_tcl a_2
        JOIN "TRAFFIC"."ARTERYDATA" b_2 ON a_2.arterycode = b_2."ARTERYCODE"
        JOIN gis.centreline c_1 ON a_2.centreline_id = c_1.geo_id
        WHERE a_2.artery_type = 2
        GROUP BY a_2.arterycode, c_1.fnode
      UNION ALL
        SELECT
          a_2.arterycode,
          c_1.tnode AS int_id,
          count(1) AS num_points
        FROM prj_volume.artery_tcl a_2
        JOIN "TRAFFIC"."ARTERYDATA" b_2 ON a_2.arterycode = b_2."ARTERYCODE"
        JOIN gis.centreline c_1 ON a_2.centreline_id = c_1.geo_id
        WHERE a_2.artery_type = 2
        GROUP BY a_2.arterycode, c_1.tnode
      ) x
      GROUP BY x.arterycode, x.int_id
      ORDER BY x.arterycode
    )
    SELECT
      a_1.arterycode,
      a_1.int_id,
      d.location,
      c.px,
      f.px AS px_secondary,
      e.latitude,
      e.longitude,
      CASE
        WHEN f.px IS NOT NULL THEN 1::double precision
        ELSE a_1.int_id
      END AS ranking
    FROM ind a_1
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
  SELECT
    a.arterycode,
    a.int_id,
    a.location,
    a.px,
    a.latitude,
    a.longitude
  FROM initial a
  JOIN (
    SELECT
      initial.arterycode,
      min(initial.ranking) AS ranking
    FROM initial
    GROUP BY initial.arterycode
  ) b USING (arterycode, ranking)
);
