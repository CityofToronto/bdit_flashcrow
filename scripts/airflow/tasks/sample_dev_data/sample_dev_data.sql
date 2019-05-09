create schema if not exists flashcrow_dev_data;

drop table if exists flashcrow_dev_data.traffic_countinfomics;
drop table if exists flashcrow_dev_data.traffic_det;

drop table if exists flashcrow_dev_data.traffic_countinfo;
drop table if exists flashcrow_dev_data.traffic_cnt_det;
drop table if exists flashcrow_dev_data.traffic_cnt_spd;

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
