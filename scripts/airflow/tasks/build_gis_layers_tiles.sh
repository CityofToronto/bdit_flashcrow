#!/bin/bash

set -euo pipefail
GIT_ROOT=/home/ec2-user/flashcrow
TASKS_ROOT="${GIT_ROOT}/scripts/airflow/tasks"

mkdir -p /data/tiles
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -f "${TASKS_ROOT}/build_gis_layers_tiles/download_hospitalsLevel2.sql" > /data/tiles/hospitalsLevel2.json
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -f "${TASKS_ROOT}/build_gis_layers_tiles/download_schoolsLevel2.sql" > /data/tiles/schoolsLevel2.json

tippecanoe --progress-interval=10 --force -o /data/tiles/hospitalsLevel2.mbtiles -l hospitalsLevel2 -Z14 -z16 -r1 /data/tiles/hospitalsLevel2.json
tippecanoe --progress-interval=10 --force -o /data/tiles/schoolsLevel2.mbtiles -l schoolsLevel2 -Z14 -z16 -r1 /data/tiles/schoolsLevel2.json
