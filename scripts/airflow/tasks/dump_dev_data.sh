#!/bin/bash

set -euo pipefail
GIT_ROOT=/home/ec2-user/flashcrow
TASKS_ROOT="${GIT_ROOT}/scripts/airflow/tasks"
FLASHCROW_DEV_DATA=/data/dev_data/flashcrow-dev-data.sql

# create required schemas
mkdir -p /data/dev_data
cp "${TASKS_ROOT}/dump_dev_data/create_schemas.sql" "${FLASHCROW_DEV_DATA}"

# copy full tables
env $(xargs < "/home/ec2-user/cot-env.config") pg_dump -t "gis.centreline" -t "gis.centreline_intersection" -t "gis.school" -t "prj_volume.artery_centreline" -t '"TRAFFIC"."CATEGORY"' -t '"TRAFFIC"."ARTERYDATA"' -x --no-owner --clean --if-exists >> "${FLASHCROW_DEV_DATA}"

# copy schemas of sampled tables
env $(xargs < "/home/ec2-user/cot-env.config") pg_dump -t "collisions.events" -t "collisions.events_centreline" -t "collisions.involved" -t '"TRAFFIC"."COUNTINFOMICS"' -t '"TRAFFIC"."DET"' -t '"TRAFFIC"."COUNTINFO"' -t '"TRAFFIC"."CNT_DET"' -t '"TRAFFIC"."CNT_SPD"' -x --no-owner --clean --if-exists --schema-only >> "${FLASHCROW_DEV_DATA}"

# copy sampled table data from flashcrow_dev_data schema
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
