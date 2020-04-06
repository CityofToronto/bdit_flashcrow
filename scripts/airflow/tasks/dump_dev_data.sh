#!/bin/bash

set -euo pipefail
GIT_ROOT=/home/ec2-user/flashcrow
TASKS_ROOT="${GIT_ROOT}/scripts/airflow/tasks"
FLASHCROW_DEV_DATA=/data/dev_data/flashcrow-dev-data.sql

# create required schemas
mkdir -p /data/dev_data
cp "${TASKS_ROOT}/dump_dev_data/create_schemas.sql" "${FLASHCROW_DEV_DATA}"

# copy schemas for unsampled views
env $(xargs < "/home/ec2-user/cot-env.config") pg_dump -t flashcrow_dev_data.gis_centreline -x --no-owner --clean --if-exists --schema-only | sed "s/flashcrow_dev_data.gis_centreline/gis.centreline/g" >> "${FLASHCROW_DEV_DATA}"
env $(xargs < "/home/ec2-user/cot-env.config") pg_dump -t flashcrow_dev_data.gis_centreline_intersection -x --no-owner --clean --if-exists --schema-only | sed "s/flashcrow_dev_data.gis_centreline_intersection/gis.centreline_intersection/g" >> "${FLASHCROW_DEV_DATA}"
env $(xargs < "/home/ec2-user/cot-env.config") pg_dump -t flashcrow_dev_data.gis_hospital -x --no-owner --clean --if-exists --schema-only | sed "s/flashcrow_dev_data.gis_hospital/gis.hospital/g" >> "${FLASHCROW_DEV_DATA}"
env $(xargs < "/home/ec2-user/cot-env.config") pg_dump -t flashcrow_dev_data.gis_school -x --no-owner --clean --if-exists --schema-only | sed "s/flashcrow_dev_data.gis_school/gis.school/g" >> "${FLASHCROW_DEV_DATA}"

env $(xargs < "/home/ec2-user/cot-env.config") pg_dump -t flashcrow_dev_data.prj_volume_artery_centreline -x --no-owner --clean --if-exists --schema-only | sed "s/flashcrow_dev_data.prj_volume_artery_centreline/prj_volume.artery_centreline/g" >> "${FLASHCROW_DEV_DATA}"

env $(xargs < "/home/ec2-user/cot-env.config") pg_dump -t flashcrow_dev_data.traffic_category -x --no-owner --clean --if-exists --schema-only | sed 's/flashcrow_dev_data.traffic_category/"TRAFFIC"."CATEGORY"/g' >> "${FLASHCROW_DEV_DATA}"
env $(xargs < "/home/ec2-user/cot-env.config") pg_dump -t flashcrow_dev_data.traffic_arterydata -x --no-owner --clean --if-exists --schema-only | sed 's/flashcrow_dev_data.traffic_arterydata/"TRAFFIC"."ARTERYDATA"/g' >> "${FLASHCROW_DEV_DATA}"

# copy data for unsampled views
echo 'COPY gis.centreline FROM stdin;' >> "${FLASHCROW_DEV_DATA}"
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -c "COPY (SELECT * FROM gis.centreline) TO stdout (FORMAT text, ENCODING 'UTF-8')" >> "${FLASHCROW_DEV_DATA}"
echo '\.' >> "${FLASHCROW_DEV_DATA}"
echo 'COPY gis.centreline_intersection FROM stdin;' >> "${FLASHCROW_DEV_DATA}"
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -c "COPY (SELECT * FROM gis.centreline_intersection) TO stdout (FORMAT text, ENCODING 'UTF-8')" >> "${FLASHCROW_DEV_DATA}"
echo '\.' >> "${FLASHCROW_DEV_DATA}"
echo 'COPY gis.hospital FROM stdin;' >> "${FLASHCROW_DEV_DATA}"
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -c "COPY (SELECT * FROM gis.hospital) TO stdout (FORMAT text, ENCODING 'UTF-8')" >> "${FLASHCROW_DEV_DATA}"
echo '\.' >> "${FLASHCROW_DEV_DATA}"
echo 'COPY gis.school FROM stdin;' >> "${FLASHCROW_DEV_DATA}"
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -c "COPY (SELECT * FROM gis.school) TO stdout (FORMAT text, ENCODING 'UTF-8')" >> "${FLASHCROW_DEV_DATA}"
echo '\.' >> "${FLASHCROW_DEV_DATA}"

echo 'COPY prj_volume.artery_centreline FROM stdin;' >> "${FLASHCROW_DEV_DATA}"
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -c "COPY (SELECT * FROM prj_volume.artery_centreline) TO stdout (FORMAT text, ENCODING 'UTF-8')" >> "${FLASHCROW_DEV_DATA}"
echo '\.' >> "${FLASHCROW_DEV_DATA}"

echo 'COPY "TRAFFIC"."CATEGORY" FROM stdin;' >> "${FLASHCROW_DEV_DATA}"
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -c "COPY (SELECT * FROM \"TRAFFIC\".\"CATEGORY\") TO stdout (FORMAT text, ENCODING 'UTF-8')" >> "${FLASHCROW_DEV_DATA}"
echo '\.' >> "${FLASHCROW_DEV_DATA}"
echo 'COPY "TRAFFIC"."ARTERYDATA" FROM stdin;' >> "${FLASHCROW_DEV_DATA}"
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -c "COPY (SELECT * FROM \"TRAFFIC\".\"ARTERYDATA\") TO stdout (FORMAT text, ENCODING 'UTF-8')" >> "${FLASHCROW_DEV_DATA}"
echo '\.' >> "${FLASHCROW_DEV_DATA}"

# copy schemas for sampled tables / views
env $(xargs < "/home/ec2-user/cot-env.config") pg_dump -t flashcrow_dev_data.collisions_events -x --no-owner --clean --if-exists --schema-only | sed "s/flashcrow_dev_data.collisions_events/collisions.events/g" >> "${FLASHCROW_DEV_DATA}"
env $(xargs < "/home/ec2-user/cot-env.config") pg_dump -t flashcrow_dev_data.collisions_events_centreline -x --no-owner --clean --if-exists --schema-only | sed "s/flashcrow_dev_data.collisions_events_centreline/collisions.events_centreline/g" >> "${FLASHCROW_DEV_DATA}"
env $(xargs < "/home/ec2-user/cot-env.config") pg_dump -t flashcrow_dev_data.collisions_involved -x --no-owner --clean --if-exists --schema-only | sed "s/flashcrow_dev_data.collisions_involved/collisions.involved/g" >> "${FLASHCROW_DEV_DATA}"

env $(xargs < "/home/ec2-user/cot-env.config") pg_dump -t flashcrow_dev_data.traffic_countinfomics -x --no-owner --clean --if-exists --schema-only | sed 's/flashcrow_dev_data.traffic_countinfomics/"TRAFFIC"."COUNTINFOMICS"/g' >> "${FLASHCROW_DEV_DATA}"
env $(xargs < "/home/ec2-user/cot-env.config") pg_dump -t flashcrow_dev_data.traffic_det -x --no-owner --clean --if-exists --schema-only | sed 's/flashcrow_dev_data.traffic_det/"TRAFFIC"."DET"/g' >> "${FLASHCROW_DEV_DATA}"
env $(xargs < "/home/ec2-user/cot-env.config") pg_dump -t flashcrow_dev_data.traffic_countinfo -x --no-owner --clean --if-exists --schema-only | sed 's/flashcrow_dev_data.traffic_countinfo/"TRAFFIC"."COUNTINFO"/g' >> "${FLASHCROW_DEV_DATA}"
env $(xargs < "/home/ec2-user/cot-env.config") pg_dump -t flashcrow_dev_data.traffic_cnt_det -x --no-owner --clean --if-exists --schema-only | sed 's/flashcrow_dev_data.traffic_cnt_det/"TRAFFIC"."CNT_DET"/g' >> "${FLASHCROW_DEV_DATA}"
env $(xargs < "/home/ec2-user/cot-env.config") pg_dump -t flashcrow_dev_data.traffic_cnt_spd -x --no-owner --clean --if-exists --schema-only | sed 's/flashcrow_dev_data.traffic_cnt_spd/"TRAFFIC"."CNT_SPD"/g' >> "${FLASHCROW_DEV_DATA}"

# copy data for sampled tables / views
echo 'COPY collisions.events FROM stdin;' >> "${FLASHCROW_DEV_DATA}"
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -c "COPY (SELECT * FROM flashcrow_dev_data.collisions_events) TO stdout (FORMAT text, ENCODING 'UTF-8')" >> "${FLASHCROW_DEV_DATA}"
echo '\.' >> "${FLASHCROW_DEV_DATA}"
echo 'COPY collisions.events_centreline FROM stdin;' >> "${FLASHCROW_DEV_DATA}"
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -c "COPY (SELECT * FROM flashcrow_dev_data.collisions_events_centreline) TO stdout (FORMAT text, ENCODING 'UTF-8')" >> "${FLASHCROW_DEV_DATA}"
echo '\.' >> "${FLASHCROW_DEV_DATA}"
echo 'COPY collisions.involved FROM stdin;' >> "${FLASHCROW_DEV_DATA}"
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -c "COPY (SELECT * FROM flashcrow_dev_data.collisions_involved) TO stdout (FORMAT text, ENCODING 'UTF-8')" >> "${FLASHCROW_DEV_DATA}"
echo '\.' >> "${FLASHCROW_DEV_DATA}"

echo 'COPY "TRAFFIC"."COUNTINFOMICS" FROM stdin;' >> "${FLASHCROW_DEV_DATA}"
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -c "COPY (SELECT * FROM flashcrow_dev_data.traffic_countinfomics) TO stdout (FORMAT text, ENCODING 'UTF-8')" >> "${FLASHCROW_DEV_DATA}"
echo '\.' >> "${FLASHCROW_DEV_DATA}"
echo 'COPY "TRAFFIC"."DET" FROM stdin;' >> "${FLASHCROW_DEV_DATA}"
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -c "COPY (SELECT * FROM flashcrow_dev_data.traffic_det) TO stdout (FORMAT text, ENCODING 'UTF-8')" >> "${FLASHCROW_DEV_DATA}"
echo '\.' >> "${FLASHCROW_DEV_DATA}"
echo 'COPY "TRAFFIC"."COUNTINFO" FROM stdin;' >> "${FLASHCROW_DEV_DATA}"
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -c "COPY (SELECT * FROM flashcrow_dev_data.traffic_countinfo) TO stdout (FORMAT text, ENCODING 'UTF-8')" >> "${FLASHCROW_DEV_DATA}"
echo '\.' >> "${FLASHCROW_DEV_DATA}"
echo 'COPY "TRAFFIC"."CNT_DET" FROM stdin;' >> "${FLASHCROW_DEV_DATA}"
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -c "COPY (SELECT * FROM flashcrow_dev_data.traffic_cnt_det) TO stdout (FORMAT text, ENCODING 'UTF-8')" >> "${FLASHCROW_DEV_DATA}"
echo '\.' >> "${FLASHCROW_DEV_DATA}"
echo 'COPY "TRAFFIC"."CNT_SPD" FROM stdin;' >> "${FLASHCROW_DEV_DATA}"
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -c "COPY (SELECT * FROM flashcrow_dev_data.traffic_cnt_spd) TO stdout (FORMAT text, ENCODING 'UTF-8')" >> "${FLASHCROW_DEV_DATA}"
echo '\.' >> "${FLASHCROW_DEV_DATA}"

# copy view definitions where appropriate
env $(xargs < "/home/ec2-user/cot-env.config") pg_dump -t location_search.centreline_intersection -x --no-owner --clean --if-exists --schema-only >> "${FLASHCROW_DEV_DATA}"

# compress to reduce copying bandwidth
tar czvf "${FLASHCROW_DEV_DATA}.tar.gz" "${FLASHCROW_DEV_DATA}"
