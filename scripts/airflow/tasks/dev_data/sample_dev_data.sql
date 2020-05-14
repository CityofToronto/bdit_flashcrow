create schema if not exists flashcrow_dev_data;

-- MATERIALIZED VIEW SCHEMAS

drop table if exists flashcrow_dev_data.gis_centreline;
drop table if exists flashcrow_dev_data.gis_centreline_intersection;
drop table if exists flashcrow_dev_data.gis_hospital;
drop table if exists flashcrow_dev_data.gis_school;

drop table if exists flashcrow_dev_data.prj_volume_artery_centreline;

drop table if exists flashcrow_dev_data.traffic_arterydata;
drop table if exists flashcrow_dev_data.traffic_category;

create table flashcrow_dev_data.gis_centreline (like gis.centreline including indexes);
create table flashcrow_dev_data.gis_centreline_intersection (like gis.centreline_intersection including indexes);
create table flashcrow_dev_data.gis_hospital (like gis.hospital including indexes);
create table flashcrow_dev_data.gis_school (like gis.school including indexes);

create table flashcrow_dev_data.prj_volume_artery_centreline (like prj_volume.artery_centreline including indexes);

create table flashcrow_dev_data.traffic_arterydata (like "TRAFFIC"."ARTERYDATA" including indexes);
create table flashcrow_dev_data.traffic_category (like "TRAFFIC"."CATEGORY" including indexes);

-- SAMPLED DATA

drop table if exists flashcrow_dev_data.collisions_events;
drop table if exists flashcrow_dev_data.collisions_events_centreline;
drop table if exists flashcrow_dev_data.collisions_involved;

drop table if exists flashcrow_dev_data.traffic_countinfomics;
drop table if exists flashcrow_dev_data.traffic_det;
drop table if exists flashcrow_dev_data.traffic_countinfo;
drop table if exists flashcrow_dev_data.traffic_cnt_det;

create table flashcrow_dev_data.collisions_events (like collisions.events including indexes);
insert into flashcrow_dev_data.collisions_events
  select * from collisions.events tablesample bernoulli (18)
  where accdate >= '2009-01-01';
insert into flashcrow_dev_data.collisions_events
  select t.* from collisions.events as t
  join collisions.events_centreline as u USING (collision_id)
  where (u.centreline_type, u.centreline_id) in (
    (1, 1142194),
    (2, 13465434)
  )
on conflict do nothing;

create table flashcrow_dev_data.collisions_events_centreline (like collisions.events_centreline including indexes);
insert into flashcrow_dev_data.collisions_events_centreline
  select t.* from collisions.events_centreline as t
    inner join flashcrow_dev_data.collisions_events as u
    on t.collision_id = u.collision_id;

create table flashcrow_dev_data.collisions_involved (like collisions.involved including indexes);
insert into flashcrow_dev_data.collisions_involved
  select t.* from collisions.involved as t
    inner join flashcrow_dev_data.collisions_events as u
    on t.collision_id = u.collision_id;

create table flashcrow_dev_data.traffic_countinfomics (like "TRAFFIC"."COUNTINFOMICS" including indexes);
insert into flashcrow_dev_data.traffic_countinfomics
  select * from "TRAFFIC"."COUNTINFOMICS" tablesample bernoulli (7.79)
  where "COUNT_DATE" >= '2009-01-01';
insert into flashcrow_dev_data.traffic_countinfomics
  select t.* from "TRAFFIC"."COUNTINFOMICS" as t
  join prj_volume.artery_centreline as u
  on t."ARTERYCODE" = u.arterycode
  where (u.centreline_type, u.centreline_id) in (
    (2, 13446886),
    (2, 30000549),
    (1, 14659630),
    (1, 1145768),
    (1, 30062737),
    (1, 9278884)
  )
on conflict do nothing;
insert into flashcrow_dev_data.traffic_countinfomics (
  select * from "TRAFFIC"."COUNTINFOMICS"
  where "COUNT_INFO_ID" = 26177
) on conflict do nothing;

create table flashcrow_dev_data.traffic_det (like "TRAFFIC"."DET" including indexes);
insert into flashcrow_dev_data.traffic_det
  select t.* from "TRAFFIC"."DET" as t
   inner join flashcrow_dev_data.traffic_countinfomics as u
   on t."COUNT_INFO_ID" = u."COUNT_INFO_ID";

create table flashcrow_dev_data.traffic_countinfo (like "TRAFFIC"."COUNTINFO" including indexes);
insert into flashcrow_dev_data.traffic_countinfo
  select * from "TRAFFIC"."COUNTINFO" tablesample bernoulli (1.17)
  where "COUNT_DATE" >= '2009-01-01';
insert into flashcrow_dev_data.traffic_countinfo (
  select t.* from "TRAFFIC"."COUNTINFO" as t
  join prj_volume.artery_centreline as u
  on t."ARTERYCODE" = u.arterycode
  where (u.centreline_type, u.centreline_id) in (
    (2, 13446886),
    (2, 30000549),
    (1, 14659630),
    (1, 1145768),
    (1, 30062737),
    (1, 9278884)
  )
) on conflict do nothing;
insert into flashcrow_dev_data.traffic_countinfo (
  select * from "TRAFFIC"."COUNTINFO"
  where "COUNT_INFO_ID" in (
    1206023,
    1415698
  )
) on conflict do nothing;

create table flashcrow_dev_data.traffic_cnt_det (like "TRAFFIC"."CNT_DET" including indexes);
insert into flashcrow_dev_data.traffic_cnt_det
  select t.* from "TRAFFIC"."CNT_DET" as t
   inner join flashcrow_dev_data.traffic_countinfo as u
   on t."COUNT_INFO_ID" = u."COUNT_INFO_ID";
