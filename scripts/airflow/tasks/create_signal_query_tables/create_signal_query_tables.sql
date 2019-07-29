DROP TABLE IF EXISTS  gis.query_table;

CREATE TABLE gis.query_table AS (

SELECT px, main, midblock, side1, side2, 'gis.traffic_signals' AS tbl
FROM gis.traffic_signals

UNION 

SELECT px, main, midblock, side1, side2, 'gis.pedestrian_crossings' AS tbl
FROM gis.pedestrian_crossings

);
