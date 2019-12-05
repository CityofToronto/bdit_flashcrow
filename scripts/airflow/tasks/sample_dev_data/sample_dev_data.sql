create schema if not exists flashcrow_dev_data;

drop table if exists flashcrow_dev_data.collisions_events;
drop table if exists flashcrow_dev_data.collisions_events_centreline;
drop table if exists flashcrow_dev_data.collisions_involved;

drop table if exists flashcrow_dev_data.traffic_countinfomics;
drop table if exists flashcrow_dev_data.traffic_det;

drop table if exists flashcrow_dev_data.traffic_countinfo;
drop table if exists flashcrow_dev_data.traffic_cnt_det;
drop table if exists flashcrow_dev_data.traffic_cnt_spd;

-- SAMPLED DATA

create table flashcrow_dev_data.collisions_events as
  select * from collisions.events tablesample bernoulli (18)
  where accdate >= '2009-01-01';
create table flashcrow_dev_data.collisions_events_centreline as
  select t.* from collisions.events_centreline as t
    inner join flashcrow_dev_data.collisions_events as u
    on t.collision_id = u.collision_id;
create table flashcrow_dev_data.collisions_involved as
  select t.* from collisions.involved as t
    inner join flashcrow_dev_data.collisions_events as u
    on t.collision_id = u.collision_id;

create table flashcrow_dev_data.traffic_countinfomics as
  select * from "TRAFFIC"."COUNTINFOMICS" tablesample bernoulli (7.79)
  where "COUNT_DATE" >= '2009-01-01';
create table flashcrow_dev_data.traffic_det as
  select t.* from "TRAFFIC"."DET" as t
   inner join flashcrow_dev_data.traffic_countinfomics as u
   on t."COUNT_INFO_ID" = u."COUNT_INFO_ID";

create table flashcrow_dev_data.traffic_countinfo as
  select * from "TRAFFIC"."COUNTINFO" tablesample bernoulli (1.17)
  where "COUNT_DATE" >= '2009-01-01';
create table flashcrow_dev_data.traffic_cnt_det as
  select t.* from "TRAFFIC"."CNT_DET" as t
   inner join flashcrow_dev_data.traffic_countinfo as u
   on t."COUNT_INFO_ID" = u."COUNT_INFO_ID";
create table flashcrow_dev_data.traffic_cnt_spd as
  select t.* from "TRAFFIC"."CNT_SPD" as t
   inner join flashcrow_dev_data.traffic_countinfo as u
   on t."COUNT_INFO_ID" = u."COUNT_INFO_ID";

-- SPECIFIC DATA NEEDED FOR TESTS

alter table flashcrow_dev_data.traffic_countinfomics add primary key ("COUNT_INFO_ID");
alter table flashcrow_dev_data.traffic_countinfo add primary key ("COUNT_INFO_ID");

insert into flashcrow_dev_data.traffic_countinfomics
  select t.* from "TRAFFIC"."COUNTINFOMICS" as t
  join prj_volume.artery_centreline as u
  on t."ARTERYCODE" = u.arterycode
  where (u.centreline_type, u.centreline_id) in (
    (2, 30000549),
    (1, 14659630),
    (1, 1145768),
    (1, 30062737),
    (1, 9278884)
  )
on conflict do nothing;

insert into flashcrow_dev_data.traffic_countinfo (
  select t.* from "TRAFFIC"."COUNTINFO" as t
  join prj_volume.artery_centreline as u
  on t."ARTERYCODE" = u.arterycode
  where (u.centreline_type, u.centreline_id) in (
    (2, 30000549),
    (1, 14659630),
    (1, 1145768),
    (1, 30062737),
    (1, 9278884)
  )
) on conflict do nothing;

insert into flashcrow_dev_data.traffic_countinfomics (
  select * from "TRAFFIC"."COUNTINFOMICS"
  where "COUNT_INFO_ID" = 26177
) on conflict do nothing;
insert into flashcrow_dev_data.traffic_det (
  select * from "TRAFFIC"."DET"
  where "COUNT_INFO_ID" = 26177
) on conflict do nothing;

insert into flashcrow_dev_data.traffic_countinfo (
  select * from "TRAFFIC"."COUNTINFO"
  where "COUNT_INFO_ID" = 1415698
) on conflict do nothing;
insert into flashcrow_dev_data.traffic_cnt_det (
  select * from "TRAFFIC"."CNT_DET"
  where "COUNT_INFO_ID" = 1415698
) on conflict do nothing;
insert into flashcrow_dev_data.traffic_cnt_spd (
  select * from "TRAFFIC"."CNT_SPD"
  where "COUNT_INFO_ID" = 1415698
) on conflict do nothing;
