create schema if not exists prj_volume;
create table if not exists prj_volume.artery_intersections (
  arterycode bigint,
  int_id double precision,
  location varchar,
  px integer,
  latitude double precision,
  longitude double precision
);
truncate table prj_volume.artery_intersections restart identity;
