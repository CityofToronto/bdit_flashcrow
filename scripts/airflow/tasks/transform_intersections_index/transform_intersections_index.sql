CREATE SCHEMA IF NOT EXISTS location_search;

CREATE MATERIALIZED VIEW IF NOT EXISTS location_search.centreline_intersection AS
  SELECT
    int_id,
    MODE() WITHIN GROUP (ORDER BY intersec5) AS intersec5,
    MIN(elevatio9) AS elevatio9
  FROM gis.centreline_intersection
  WHERE
    intersec5 IS NOT NULL AND intersec5 LIKE '%/%' AND intersec5 NOT LIKE '% Pl%'
    AND elevatio9 != 0 AND elevatio9 < 501700
  GROUP BY int_id;

CREATE UNIQUE INDEX IF NOT EXISTS ls_centreline_intersection_int_id ON location_search.centreline_intersection (int_id);
CREATE INDEX ls_centreline_intersection_tsvector_intersec5 ON location_search.centreline_intersection USING GIN (to_tsvector('english', intersec5));
CREATE INDEX ls_centreline_intersection_trgm_intersec5 ON location_search.centreline_intersection USING GIN (intersec5 gin_trgm_ops);

REFRESH MATERIALIZED VIEW CONCURRENTLY location_search.centreline_intersection;
