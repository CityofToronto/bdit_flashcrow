CREATE SCHEMA IF NOT EXISTS prj_volume_tmp;

CREATE MATERIALIZED VIEW IF NOT EXISTS prj_volume_tmp.arteries_intersection AS (
  WITH artery_links AS (
    SELECT
      "ARTERYCODE" AS arterycode,
      "LINKID"::bigint AS link_id
    FROM "TRAFFIC"."ARTERYDATA"
    WHERE "LINKID" NOT LIKE '%@%'
  )
  SELECT
    al.arterycode,
    al.link_id,
    ni.int_id,
    ni.geom
  FROM artery_links al
  LEFT JOIN prj_volume_tmp.nodes_intersection ni USING (link_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS arteries_intersection_arterycode ON prj_volume_tmp.arteries_intersection (arterycode);

REFRESH MATERIALIZED VIEW CONCURRENTLY prj_volume_tmp.arteries_intersection;

CREATE MATERIALIZED VIEW IF NOT EXISTS prj_volume_tmp.arteries_midblock AS (
  WITH artery_links AS (
    SELECT
      "ARTERYCODE" AS arterycode,
      SUBSTRING("LINKID", '([0-9]{1,20})@?')::bigint AS from_link_id,
      SUBSTRING("LINKID", '@([0-9]{1,20})')::bigint AS to_link_id
    FROM "TRAFFIC"."ARTERYDATA"
    WHERE "LINKID" LIKE '%@%'
  )
  SELECT
    al.arterycode,
    al.from_link_id,
    ni_from.int_id AS from_int_id,
    al.to_link_id,
    ni_to.int_id AS to_int_id,
    ST_MakeLine(ni_from.geom, ni_to.geom) AS geom
  FROM artery_links al
  LEFT JOIN prj_volume_tmp.nodes_intersection ni_from ON al.from_link_id = ni_from.link_id
  LEFT JOIN prj_volume_tmp.nodes_intersection ni_to ON al.to_link_id = ni_to.link_id
);
CREATE UNIQUE INDEX IF NOT EXISTS arteries_midblock_arterycode ON prj_volume_tmp.arteries_midblock (arterycode);

REFRESH MATERIALIZED VIEW CONCURRENTLY prj_volume_tmp.arteries_midblock;
