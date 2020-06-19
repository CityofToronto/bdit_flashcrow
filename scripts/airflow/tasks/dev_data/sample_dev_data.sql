create schema if not exists flashcrow_dev_data;

-- MATERIALIZED VIEW SCHEMAS

drop table if exists flashcrow_dev_data.counts_arteries_centreline;

drop table if exists flashcrow_dev_data.gis_centreline;
drop table if exists flashcrow_dev_data.gis_centreline_intersection;
drop table if exists flashcrow_dev_data.gis_hospital;
drop table if exists flashcrow_dev_data.gis_school;
drop table if exists flashcrow_dev_data.gis_traffic_signal;

drop table if exists flashcrow_dev_data.traffic_arterydata;
drop table if exists flashcrow_dev_data.traffic_category;

create table flashcrow_dev_data.counts_arteries_centreline (like counts.arteries_centreline including indexes);

create table flashcrow_dev_data.gis_centreline (like gis.centreline including indexes);
create table flashcrow_dev_data.gis_centreline_intersection (like gis.centreline_intersection including indexes);
create table flashcrow_dev_data.gis_hospital (like gis.hospital including indexes);
create table flashcrow_dev_data.gis_school (like gis.school including indexes);
create table flashcrow_dev_data.gis_traffic_signal (like gis.traffic_signal including indexes);

create table flashcrow_dev_data.traffic_arterydata (like "TRAFFIC"."ARTERYDATA" including indexes);
create table flashcrow_dev_data.traffic_category (like "TRAFFIC"."CATEGORY" including indexes);

-- SAMPLED DATA

drop table if exists flashcrow_dev_data.collisions_events;
drop table if exists flashcrow_dev_data.collisions_events_centreline;
drop table if exists flashcrow_dev_data.collisions_involved;

drop table if exists flashcrow_dev_data.counts_arteries_groups;
drop table if exists flashcrow_dev_data.counts_counts_multiday_runs;
drop table if exists flashcrow_dev_data.counts_studies;

drop table if exists flashcrow_dev_data.traffic_countinfomics;
drop table if exists flashcrow_dev_data.traffic_det;
drop table if exists flashcrow_dev_data.traffic_countinfo;
drop table if exists flashcrow_dev_data.traffic_cnt_det;

create table flashcrow_dev_data.collisions_events (like collisions.events including indexes);
insert into flashcrow_dev_data.collisions_events
  select * from collisions.events tablesample bernoulli (10)
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

create table flashcrow_dev_data.counts_studies (like counts.studies including indexes);
insert into flashcrow_dev_data.counts_studies
  select * from counts.studies tablesample bernoulli (0.25)
  where start_date >= '2009-01-01'
  and "CATEGORY_ID" = 2;
insert into flashcrow_dev_data.counts_studies
  select * from counts.studies tablesample bernoulli (0.5)
  where start_date >= '2009-01-01'
  and "CATEGORY_ID" = 6;
insert into flashcrow_dev_data.counts_studies
  select * from counts.studies tablesample bernoulli (2)
  where start_date >= '2009-01-01'
  and "CATEGORY_ID" not in (2, 6);
insert into flashcrow_dev_data.counts_studies
  select * from counts.studies
  where (centreline_type, centreline_id) in (
    (2, 13446886),
    (2, 30000549),
    (1, 14659630),
    (1, 1145768),
    (1, 30062737),
    (1, 9278884)
  )
on conflict do nothing;
insert into flashcrow_dev_data.counts_studies (
  select * from counts.studies
  where ("CATEGORY_ID", count_group_id) in (
    (5, 26177),
    (1, 1206015),
    (4, 1415698)
  )
) on conflict do nothing;

create table flashcrow_dev_data.counts_arteries_groups (like counts.arteries_groups including indexes);
insert into flashcrow_dev_data.counts_arteries_groups
  with artery_group_ids as (
    select distinct(ag.group_id) as group_id
    from counts.arteries_groups ag
    inner join flashcrow_dev_data.counts_studies cs
    on ag.group_id = cs.artery_group_id
  )
  select ag.* from counts.arteries_groups ag
  inner join artery_group_ids agi using (group_id);

create table flashcrow_dev_data.counts_counts_multiday_runs (like counts.counts_multiday_runs including indexes);
insert into flashcrow_dev_data.counts_counts_multiday_runs
  with arterycode_start_dates as (
    select ag.arterycode, cs.start_date
    from flashcrow_dev_data.counts_studies cs
    inner join counts.arteries_groups ag on cs.artery_group_id = ag.group_id
  ), count_group_ids as (
    select distinct(cmr.group_id) as group_id
    from counts.counts_multiday_runs cmr
    inner join arterycode_start_dates asd
    on cmr."ARTERYCODE" = asd.arterycode and cmr."COUNT_DATE" = asd.start_date
  )
  select cmr.* from counts.counts_multiday_runs cmr
  inner join count_group_ids cgi using (group_id);

create table flashcrow_dev_data.traffic_countinfomics (like "TRAFFIC"."COUNTINFOMICS" including indexes);
insert into flashcrow_dev_data.traffic_countinfomics
  select t.* from "TRAFFIC"."COUNTINFOMICS" t
  inner join flashcrow_dev_data.counts_counts_multiday_runs u
  using ("CATEGORY_ID", "COUNT_INFO_ID");

create table flashcrow_dev_data.traffic_det (like "TRAFFIC"."DET" including indexes);
insert into flashcrow_dev_data.traffic_det
  select t.* from "TRAFFIC"."DET" as t
   inner join flashcrow_dev_data.traffic_countinfomics as u
   using ("COUNT_INFO_ID");

create table flashcrow_dev_data.traffic_countinfo (like "TRAFFIC"."COUNTINFO" including indexes);
insert into flashcrow_dev_data.traffic_countinfo
  select t.* from "TRAFFIC"."COUNTINFO" t
  inner join flashcrow_dev_data.counts_counts_multiday_runs u
  using ("CATEGORY_ID", "COUNT_INFO_ID");

create table flashcrow_dev_data.traffic_cnt_det (like "TRAFFIC"."CNT_DET" including indexes);
insert into flashcrow_dev_data.traffic_cnt_det
  select t.* from "TRAFFIC"."CNT_DET" as t
   inner join flashcrow_dev_data.traffic_countinfo as u
   using ("COUNT_INFO_ID");
