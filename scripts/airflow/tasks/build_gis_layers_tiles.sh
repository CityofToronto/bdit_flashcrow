#!/bin/bash

set -euo pipefail
GIT_ROOT=/home/ec2-user/flashcrow
TASKS_ROOT="${GIT_ROOT}/scripts/airflow/tasks"

mkdir -p /data/tiles
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -f "${TASKS_ROOT}/build_gis_layers_tiles/download_schoolsLevel2.sql" > /data/tiles/schoolsLevel2.json

tippecanoe --force -o /data/tiles/schoolsLevel2.mbtiles -l schoolsLevel2 -Z14 -z16 /data/tiles/schoolsLevel2.json
