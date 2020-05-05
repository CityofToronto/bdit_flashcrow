CREATE SCHEMA IF NOT EXISTS counts;

CREATE MATERIALIZED VIEW IF NOT EXISTS counts.arteries_midblock_link AS (
  SELECT
    "ARTERYCODE" AS arterycode,
    substring("LINKID", '([0-9]{1,20})@?')::bigint AS from_link_id,
    substring("LINKID", '@([0-9]{1,20})')::bigint AS to_link_id,
    "GEO_ID"::bigint AS geo_id
  FROM "TRAFFIC"."ARTERYDATA"
  WHERE "LINKID" LIKE '%@%'
);
CREATE UNIQUE INDEX IF NOT EXISTS arteries_midblock_link_arterycode ON counts.arteries_midblock_link (arterycode);

REFRESH MATERIALIZED VIEW CONCURRENTLY counts.arteries_midblock_link;

CREATE MATERIALIZED VIEW IF NOT EXISTS counts.arteries_midblock_manual_corr AS (
  SELECT
    arterycode,
    MODE() WITHIN GROUP (ORDER BY centreline_id) AS geo_id
  FROM counts.arteries_manual_corr amc
  JOIN counts.arteries_midblock_link aml USING (arterycode)
  GROUP BY arterycode
);
CREATE UNIQUE INDEX IF NOT EXISTS arteries_midblock_manual_corr_arterycode ON counts.arteries_midblock_manual_corr (arterycode);

REFRESH MATERIALIZED VIEW CONCURRENTLY counts.arteries_midblock_manual_corr;
