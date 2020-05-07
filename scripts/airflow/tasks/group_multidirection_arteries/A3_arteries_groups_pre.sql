CREATE SCHEMA IF NOT EXISTS counts;
CREATE SCHEMA IF NOT EXISTS counts_new;

CREATE TABLE IF NOT EXISTS counts_new.arteries_groups (
  arterycode BIGINT NOT NULL,
  match_on_case SMALLINT NOT NULL,
  group_id BIGINT NOT NULL,
  centreline_type SMALLINT NOT NULL,
  centreline_id BIGINT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS arteries_groups_arterycode ON counts_new.arteries_groups (arterycode);

TRUNCATE TABLE counts_new.arteries_groups;

-- Case 1: intersections
INSERT INTO counts_new.arteries_groups (
  SELECT
    arterycode,
    1 AS match_on_case,
    arterycode AS group_id,
    2 AS centreline_type,
    int_id AS centreline_id
  FROM counts.arteries_intersection
  WHERE int_id IS NOT NULL
);

-- Case 2: solo midblocks
INSERT INTO counts_new.arteries_groups (
  SELECT
    arterycode,
    2 AS match_on_case,
    arterycode AS group_id,
    1 AS centreline_type,
    geo_id AS centreline_id
  FROM counts.arteries_midblock_solo
);

-- Case 3: link-paired midblocks
INSERT INTO counts_new.arteries_groups (
  SELECT
    arterycode1 AS arterycode,
    3 AS match_on_case,
    arterycode1 AS group_id,
    1 AS centreline_type,
    geo_id AS centreline_id
  FROM counts.arteries_midblock_link_pairs
  UNION ALL
  SELECT
    arterycode2 AS arterycode,
    3 AS match_on_case,
    arterycode1 AS group_id,
    1 AS centreline_type,
    geo_id AS centreline_id
  FROM counts.arteries_midblock_link_pairs
);

-- other cases continue in A4, A5
