create table if not exists prj_volume.artery_segments (
  arterycode bigint,
  centreline_id bigint,
  geom geometry(Point, 4326)
);
truncate table prj_volume.artery_segments restart identity;
-- This is an *approximation* of ST_Line_Interpolate_Point(geom, 0.5) for
-- MultiLineStrings.
-- See https://gis.stackexchange.com/a/80469
insert into prj_volume.artery_segments (
  select
    pvat.arterycode,
    pvat.centreline_id,
    ST_ClosestPoint(gc.geom, ST_Centroid(gc.geom))
  from gis.centreline gc
  join prj_volume.artery_tcl pvat
  on gc.geo_id = pvat.centreline_id
  where pvat.artery_type = 1 and pvat.centreline_id is not null
  order by pvat.arterycode asc
);
