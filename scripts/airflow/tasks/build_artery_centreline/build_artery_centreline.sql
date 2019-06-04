create table if not exists prj_volume.artery_centreline (
  arterycode bigint,
  centreline_id bigint,
  centreline_type smallint,
  geom geometry(Point,4326)
);
create index if not exists artery_centreline_arterycode on prj_volume.artery_centreline (arterycode);
create index if not exists artery_centreline_centreline_id on prj_volume.artery_centreline (centreline_id);
create index if not exists artery_centreline_geom on prj_volume.artery_centreline using gist (geom);
truncate table prj_volume.artery_centreline restart identity;
insert into prj_volume.artery_centreline (
  select arterycode, centreline_id, 1, geom from prj_volume.artery_segments union
  select arterycode, cast(int_id as bigint), 2, ST_SetSrid(ST_MakePoint(longitude, latitude), 4326) from prj_volume.artery_intersections
);
