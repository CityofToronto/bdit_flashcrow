CREATE SCHEMA IF NOT EXISTS counts;
CREATE SCHEMA IF NOT EXISTS counts_new;

CREATE TABLE IF NOT EXISTS counts_new.arteries_intersection (
  arterycode BIGINT NOT NULL,
  match_on_case SMALLINT NOT NULL,
  int_id BIGINT,
  geom GEOMETRY(POINT, 4326)
);
CREATE UNIQUE INDEX IF NOT EXISTS arteries_intersection_arterycode ON counts_new.arteries_intersection (arterycode);

TRUNCATE TABLE counts_new.arteries_intersection;

-- Case 1: manual corrections
INSERT INTO counts_new.arteries_intersection (
  SELECT aimc.arterycode, 1 AS match_on_case, aimc.int_id, ci.geom
  FROM counts.arteries_intersection_manual_corr aimc
  JOIN counts.centreline_intersection ci USING (int_id)
);

-- Case 2: has match in `arteries_intersection_int_id` with `int_id`
INSERT INTO counts_new.arteries_intersection (
  SELECT aiii.arterycode, 2 AS match_on_case, aiii.int_id, aiii.geom
  FROM counts.arteries_intersection_int_id aiii
  LEFT JOIN counts_new.arteries_intersection ai USING (arterycode)
  WHERE ai.arterycode IS NULL AND aiii.int_id IS NOT NULL
);

-- Case 3: fail to match
INSERT INTO counts_new.arteries_intersection (
  SELECT ail.arterycode, 3 AS match_on_case, NULL AS int_id, NULL AS geom
  FROM counts.arteries_intersection_link ail
  LEFT JOIN counts_new.arteries_intersection ai USING (arterycode)
  WHERE ai.arterycode IS NULL
);

-- Update double-buffered view.
CREATE MATERIALIZED VIEW IF NOT EXISTS counts.arteries_intersection AS
  SELECT * FROM counts_new.arteries_intersection;
CREATE UNIQUE INDEX IF NOT EXISTS arteries_intersection_arterycode ON counts.arteries_intersection (arterycode);

REFRESH MATERIALIZED VIEW CONCURRENTLY counts.arteries_intersection;
