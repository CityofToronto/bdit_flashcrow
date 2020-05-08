CREATE SCHEMA IF NOT EXISTS counts;

CREATE MATERIALIZED VIEW IF NOT EXISTS counts.counts_multiday_runs AS (
  SELECT * FROM (
    WITH diffs AS (
      SELECT
        ci."COUNT_INFO_ID",
        ci."ARTERYCODE",
        ci."CATEGORY_ID",
        ci."COUNT_DATE",
        dense_rank() OVER (w1) - date_part('DAYS', ci."COUNT_DATE" - make_timestamp(1970, 1, 1, 0, 0, 0)) AS diff
      FROM "TRAFFIC"."COUNTINFO" ci
      JOIN "TRAFFIC"."ARTERYDATA" ad USING ("ARTERYCODE")
      WHERE ad."COUNT_TYPE" != 'PermAutom'
      WINDOW
        w1 AS (PARTITION BY ci."ARTERYCODE", ci."CATEGORY_ID" ORDER BY ci."COUNT_DATE")
    ),
    groups AS (
      SELECT "ARTERYCODE", "CATEGORY_ID", diff, MIN("COUNT_INFO_ID") AS group_id
      FROM diffs
      GROUP BY "ARTERYCODE", "CATEGORY_ID", diff
    )
    SELECT
      d."ARTERYCODE", d."CATEGORY_ID",
      g.group_id, d."COUNT_INFO_ID", d."COUNT_DATE",
      FALSE AS perm_autom
    FROM diffs d JOIN groups g
      ON d."ARTERYCODE" = g."ARTERYCODE"
      AND d."CATEGORY_ID" = g."CATEGORY_ID"
      AND d.diff = g.diff
  ) t1 UNION ALL (
    SELECT
      ci."ARTERYCODE", ci."CATEGORY_ID",
      ci."COUNT_INFO_ID" AS group_id, ci."COUNT_INFO_ID", ci."COUNT_DATE",
      TRUE AS perm_autom
    FROM "TRAFFIC"."COUNTINFO" ci
    JOIN "TRAFFIC"."ARTERYDATA" ad USING ("ARTERYCODE")
    WHERE ad."COUNT_TYPE" = 'PermAutom'
  ) UNION ALL (
    WITH diffs AS (
      SELECT
        "COUNT_INFO_ID",
        "ARTERYCODE",
        "CATEGORY_ID",
        "COUNT_DATE",
        dense_rank() OVER (w1) - date_part('DAYS', "COUNT_DATE" - make_timestamp(1970, 1, 1, 0, 0, 0)) AS diff
      FROM "TRAFFIC"."COUNTINFOMICS" cim
      WINDOW
        w1 AS (PARTITION BY "ARTERYCODE" ORDER BY "COUNT_DATE")
    ),
    groups AS (
      SELECT "ARTERYCODE", diff, MIN("COUNT_INFO_ID") AS group_id
      FROM diffs
      GROUP BY "ARTERYCODE", diff
    )
    SELECT
      d."ARTERYCODE", d."CATEGORY_ID",
      g.group_id, d."COUNT_INFO_ID", d."COUNT_DATE",
      FALSE AS perm_autom
    FROM diffs d JOIN groups g
      ON d."ARTERYCODE" = g."ARTERYCODE"
      AND d.diff = g.diff
  )
);
CREATE UNIQUE INDEX IF NOT EXISTS counts_multiday_runs_count ON counts.counts_multiday_runs ("CATEGORY_ID", "COUNT_INFO_ID");
CREATE INDEX IF NOT EXISTS counts_multiday_runs_arterycode ON counts.counts_multiday_runs ("ARTERYCODE");
CREATE INDEX IF NOT EXISTS counts_multiday_runs_group_id ON counts.counts_multiday_runs (group_id);

REFRESH MATERIALIZED VIEW CONCURRENTLY counts.counts_multiday_runs;
