CREATE SCHEMA IF NOT EXISTS counts;

-- TODO: figure out how / whether to handle midblock corrections here
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
