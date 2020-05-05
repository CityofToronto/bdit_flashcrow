CREATE SCHEMA IF NOT EXISTS counts;
CREATE SCHEMA IF NOT EXISTS counts_new;

CREATE TABLE IF NOT EXISTS counts_new.arteries_midblock (
  arterycode BIGINT NOT NULL,
  match_on_case SMALLINT NOT NULL,
  geo_id BIGINT,
  geom GEOMETRY(POINT, 4326)
);
CREATE UNIQUE INDEX IF NOT EXISTS arteries_midblock_arterycode ON counts_new.arteries_midblock (arterycode);

TRUNCATE TABLE counts_new.arteries_midblock;

-- Case 1: manual corrections
INSERT INTO counts_new.arteries_midblock (
  SELECT
    ammc.arterycode,
    1 AS match_on_case,
    ammc.geo_id,
    ST_Transform(ST_ClosestPoint(
      ST_Transform(c.geom, 2952),
      ST_Transform(ST_Centroid(c.geom), 2952)
    ), 4326) as geom
  FROM counts.arteries_midblock_manual_corr ammc
  JOIN gis.centreline c USING (geo_id)
);

-- Case 2: has `GEO_ID` that matches `centreline`
INSERT INTO counts_new.arteries_midblock (
  SELECT
    aml.arterycode AS arterycode,
    2 AS match_on_case,
    aml.geo_id AS geo_id,
    ST_Transform(ST_ClosestPoint(
      ST_Transform(c.geom, 2952),
      ST_Transform(ST_Centroid(c.geom), 2952)
    ), 4326) as geom
  FROM counts.arteries_midblock_link aml
  JOIN counts.centreline c USING (geo_id)
  LEFT JOIN counts_new.arteries_midblock am USING (arterycode)
  WHERE am.arterycode IS NULL
);

-- Case 3: 2 matched nodes, appears in `arteries_midblock_geo_id_single`
INSERT INTO counts_new.arteries_midblock (
  SELECT
    amgis.arterycode,
    3 AS match_on_case,
    amgis.geo_id,
    ST_Transform(ST_ClosestPoint(
      ST_Transform(c.geom, 2952),
      ST_Transform(ST_Centroid(c.geom), 2952)
    ), 4326) as geom
  FROM counts.arteries_midblock_geo_id_single amgis
  JOIN counts.centreline c USING (geo_id)
  LEFT JOIN counts_new.arteries_midblock am USING (arterycode)
  WHERE am.arterycode IS NULL
);

-- Case 4: 2 matched nodes, appears in `arteries_midblock_geo_id_multiple`
-- TODO

-- Case 5: 2 matched nodes, does not appear in `arteries_midblock_geo_id`
-- TODO

-- Case 6: 1 matched node
-- TODO

-- Case 7: fail to match
INSERT INTO counts_new.arteries_midblock (
  SELECT aml.arterycode, 7 AS match_on_case, NULL AS geo_id, NULL AS geom
  FROM counts.arteries_midblock_link aml
  LEFT JOIN counts_new.arteries_midblock am USING (arterycode)
  WHERE am.arterycode IS NULL
);

-- Update double-buffered view.
CREATE MATERIALIZED VIEW IF NOT EXISTS counts.arteries_midblock AS
  SELECT * FROM counts_new.arteries_midblock;
CREATE UNIQUE INDEX IF NOT EXISTS arteries_midblock_arterycode ON counts.arteries_midblock (arterycode);

REFRESH MATERIALIZED VIEW CONCURRENTLY counts.arteries_midblock;
