-- Case 5: remaining arterycodes as singles
INSERT INTO counts_new.arteries_groups (
  SELECT
    am.arterycode,
    5 AS match_on_case,
    am.arterycode AS group_id,
    1 AS centreline_type,
    geo_id AS centreline_id
  FROM counts.arteries_midblock am
  LEFT JOIN counts_new.arteries_groups ag USING (arterycode)
  WHERE am.geo_id IS NOT NULL AND ag.arterycode IS NULL
);

-- Update double-buffered view.
CREATE MATERIALIZED VIEW IF NOT EXISTS counts.arteries_groups AS
  SELECT * FROM counts_new.arteries_groups;
CREATE UNIQUE INDEX IF NOT EXISTS arteries_groups_arterycode ON counts.arteries_groups (arterycode);
CREATE INDEX IF NOT EXISTS arteries_groups_group_id ON counts.arteries_groups (group_id);
CREATE INDEX IF NOT EXISTS arteries_groups_centreline ON counts.arteries_groups (centreline_type, centreline_id);

REFRESH MATERIALIZED VIEW CONCURRENTLY counts.arteries_groups;
