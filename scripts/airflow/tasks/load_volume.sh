#!/bin/bash

set -euo pipefail
GIT_ROOT=/home/ec2-user/flashcrow
TASKS_ROOT="${GIT_ROOT}/scripts/airflow/tasks"
AADT_CSV=/data/aadt_volume/prj_volume_aadt.csv
AADT_SQL=/data/aadt_volume/prj_volume_aadt.sql

mkdir -p /data/aadt_volume
cp "${TASKS_ROOT}/load_volume/load_volume_table.sql" "${AADT_SQL}"

echo 'COPY "prj_volume_new"."aadt_raw" FROM stdin WITH (FORMAT csv, HEADER TRUE);' >> "${AADT_SQL}"
cat "${AADT_CSV}" >> "${AADT_SQL}"
echo '\.' >> "${AADT_SQL}"

cat "${TASKS_ROOT}/load_volume/load_volume_view.sql" >> "${AADT_SQL}"

env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 < "${AADT_SQL}"
