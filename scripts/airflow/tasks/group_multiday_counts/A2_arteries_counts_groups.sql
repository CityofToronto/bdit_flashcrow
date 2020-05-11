CREATE SCHEMA IF NOT EXISTS counts;

CREATE MATERIALIZED VIEW IF NOT EXISTS counts.arteries_counts_groups AS (
  WITH counts_groups AS (
    SELECT
      "ARTERYCODE" AS arterycode,
      "CATEGORY_ID",
      group_id,
      MIN("COUNT_DATE") AS start_date,
      MAX("COUNT_DATE") AS end_date
    FROM counts.counts_multiday_runs
    GROUP BY ("ARTERYCODE", "CATEGORY_ID", group_id)
  ), counts_groups_date_stats AS (
    SELECT
      "CATEGORY_ID",
      group_id AS count_group_id,
      CASE
        WHEN "CATEGORY_ID" = 5 THEN NULL
        ELSE COUNT(*) * 24
      END AS duration,
      ARRAY_AGG(
        DISTINCT date_part('dow', "COUNT_DATE")
        ORDER BY date_part('dow', "COUNT_DATE")
      ) AS "daysOfWeek"
    FROM counts.counts_multiday_runs
    GROUP BY ("ARTERYCODE", "CATEGORY_ID", group_id)
  ), grouped_arteries AS (
    SELECT
      ag.group_id AS artery_group_id,
      cg."CATEGORY_ID",
      cg.group_id AS count_group_id,
      cg.start_date,
      cg.end_date
    FROM counts.arteries_groups ag
    JOIN counts_groups cg USING (arterycode)
  ), grouped_arteries_counts AS (
    SELECT
      artery_group_id,
      "CATEGORY_ID",
      MIN(count_group_id) AS count_group_id,
      start_date,
      end_date
    FROM grouped_arteries
    GROUP BY (artery_group_id, "CATEGORY_ID", start_date, end_date)
    ORDER BY artery_group_id, "CATEGORY_ID", start_date
  )
  SELECT
    gac.artery_group_id,
    gac."CATEGORY_ID",
    gac.count_group_id,
    gac.start_date,
    gac.end_date,
    cgds.duration,
    cgds."daysOfWeek"
  FROM grouped_arteries_counts gac
  JOIN counts_groups_date_stats cgds USING ("CATEGORY_ID", count_group_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS arteries_counts_groups_group ON counts.arteries_counts_groups (artery_group_id, "CATEGORY_ID", count_group_id);
CREATE INDEX IF NOT EXISTS arteries_counts_groups_count_group ON counts.arteries_counts_groups ("CATEGORY_ID", count_group_id);

REFRESH MATERIALIZED VIEW CONCURRENTLY counts.arteries_counts_groups;
