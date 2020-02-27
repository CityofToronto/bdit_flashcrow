CREATE SCHEMA IF NOT EXISTS prj_volume;

CREATE MATERIALIZED VIEW IF NOT EXISTS prj_volume.artery_centreline AS (
  (
    select
      pvat.arterycode,
      pvat.centreline_id,
      1 as centreline_type,
      ST_Transform(ST_ClosestPoint(
        ST_Transform(gc.geom, 2952),
        ST_Transform(ST_Centroid(gc.geom), 2952)
      ), 4326) as geom
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
create index IF NOT EXISTS artery_centreline_arterycode on prj_volume.artery_centreline (arterycode);
create index IF NOT EXISTS artery_centreline_centreline_id on prj_volume.artery_centreline (centreline_id);
create index IF NOT EXISTS artery_centreline_geom on prj_volume.artery_centreline using gist (geom);
create index IF NOT EXISTS artery_centreline_srid3857_geom ON prj_volume.artery_centreline using gist (ST_Transform(geom, 3857));
create index IF NOT EXISTS artery_centreline_srid2952_geom ON prj_volume.artery_centreline using gist (ST_Transform(geom, 2952));

REFRESH MATERIALIZED VIEW CONCURRENTLY prj_volume.artery_centreline;
