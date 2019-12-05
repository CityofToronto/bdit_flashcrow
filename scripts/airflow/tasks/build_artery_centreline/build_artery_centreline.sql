drop table if exists prj_volume.artery_centreline;
create table prj_volume.artery_centreline as (
  (
    select
      pvat.arterycode,
      pvat.centreline_id,
      1 as centreline_type,
      ST_ClosestPoint(gc.geom, ST_Centroid(gc.geom)) as geom
    from gis.centreline gc
    join prj_volume.artery_tcl pvat
    on gc.geo_id = pvat.centreline_id
    where pvat.artery_type = 1 and pvat.centreline_id is not null
    order by pvat.arterycode asc
  ) UNION ALL (
    select
      arterycode,
      cast(int_id as bigint) as centreline_id,
      2 as centreline_type,
      ST_SetSrid(ST_MakePoint(longitude, latitude), 4326) as geom
    from prj_volume.artery_intersections
  )
);
create index artery_centreline_arterycode on prj_volume.artery_centreline (arterycode);
create index artery_centreline_centreline_id on prj_volume.artery_centreline (centreline_id);
create index artery_centreline_geom on prj_volume.artery_centreline using gist (geom);
create index artery_centreline_srid3857_geom ON prj_volume.artery_centreline using gist (ST_Transform(geom, 3857));
