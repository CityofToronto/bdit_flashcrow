DROP TABLE IF EXISTS  gis.query_table;

CREATE TABLE gis.query_table AS (

SELECT px::INT, (CASE WHEN midblock IS NOT NULL THEN midblock || ' ' ELSE '' END)  || main || (CASE WHEN side1 IS NOT NULL THEN ' AT ' || side1 ELSE '' END)  || 
(CASE WHEN side2 IS NOT NULL THEN ' AND ' || side2 ELSE '' END) AS description, 'gis.traffic_signals' AS tbl
FROM gis.traffic_signals

UNION 

SELECT px::INT,  (CASE WHEN midblock IS NOT NULL THEN midblock || ' ' ELSE '' END)  || main || (CASE WHEN side1 IS NOT NULL THEN ' AT ' || side1 ELSE '' END) || 
(CASE WHEN side2 IS NOT NULL THEN ' AND ' || side2 ELSE '' END) AS description, 'gis.pedestrian_crossings' AS tbl
FROM gis.pedestrian_crossings

);

CREATE INDEX idx_query_tbl_px
ON gis.query_table(px);
