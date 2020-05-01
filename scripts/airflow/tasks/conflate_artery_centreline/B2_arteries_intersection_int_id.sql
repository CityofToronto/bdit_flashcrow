CREATE SCHEMA IF NOT EXISTS counts;

CREATE MATERIALIZED VIEW IF NOT EXISTS counts.arteries_intersection_int_id AS (
  WITH artery_links AS (
    SELECT
      "ARTERYCODE" AS arterycode,
      "LINKID"::bigint AS link_id
    FROM "TRAFFIC"."ARTERYDATA"
    WHERE "LINKID" NOT LIKE '%@%'
  )
  SELECT al.arterycode, ni.int_id, ni.geom
  FROM artery_links al
  JOIN prj_volume_tmp.nodes_intersection ni USING (link_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS arteries_intersection_int_id_arterycode ON counts.arteries_intersection_int_id (arterycode);

REFRESH MATERIALIZED VIEW CONCURRENTLY counts.arteries_intersection_int_id;
