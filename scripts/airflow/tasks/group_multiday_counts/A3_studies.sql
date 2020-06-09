CREATE SCHEMA IF NOT EXISTS counts;

CREATE MATERIALIZED VIEW IF NOT EXISTS counts.studies AS (
  WITH study_hours AS (
    SELECT
      acg."CATEGORY_ID",
      acg.count_group_id,
      CASE
        WHEN "COUNT_TYPE" = 'R' THEN 'ROUTINE'
        WHEN "COUNT_TYPE" = 'P' THEN 'SCHOOL'
        ELSE 'OTHER'
      END AS hours
    FROM counts.arteries_counts_groups acg
    JOIN "TRAFFIC"."COUNTINFOMICS" cim
      ON acg."CATEGORY_ID" = cim."CATEGORY_ID"
      AND acg.count_group_id = cim."COUNT_INFO_ID"
    WHERE acg."CATEGORY_ID" = 5
  ), group_hours AS (
    SELECT acg.*, sh.hours
    FROM counts.arteries_counts_groups acg
    LEFT JOIN study_hours sh USING ("CATEGORY_ID", count_group_id)
  )
  SELECT
    gh.*,
    ag.centreline_type,
    ag.centreline_id,
    ag.geom
  FROM group_hours gh
  JOIN counts.arteries_groups ag ON gh.artery_group_id = ag.arterycode
);
CREATE UNIQUE INDEX IF NOT EXISTS studies_count_group ON counts.studies ("CATEGORY_ID", count_group_id);
CREATE INDEX IF NOT EXISTS studies_centreline ON counts.studies (centreline_type, centreline_id);
CREATE INDEX IF NOT EXISTS studies_geom ON counts.studies USING GIST (geom);
CREATE INDEX IF NOT EXISTS studies_srid3857_geom ON counts.studies USING GIST (ST_Transform(geom, 3857));
CREATE INDEX IF NOT EXISTS studies_srid2952_geom ON counts.studies USING GIST (ST_Transform(geom, 2952));

REFRESH MATERIALIZED VIEW CONCURRENTLY counts.studies;
