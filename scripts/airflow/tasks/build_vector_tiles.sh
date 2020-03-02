#!/bin/bash

set -euo pipefail
GIT_ROOT=/home/ec2-user/flashcrow
TASKS_ROOT="${GIT_ROOT}/scripts/airflow/tasks"

mkdir -p /data/tiles
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -f "${TASKS_ROOT}/build_vector_tiles/download_midblocks.sql" > /data/tiles/midblocks.json
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -f "${TASKS_ROOT}/build_vector_tiles/download_intersections.sql" > /data/tiles/intersections.json

tippecanoe --force -o /data/tiles/midblocks.mbtiles -l midblocks -Z10 -z19 -J "${TASKS_ROOT}/build_vector_tiles/filter_midblocks.json" /data/tiles/midblocks.json
tippecanoe --force -o /data/tiles/intersections.mbtiles -l intersections -Z14 -z19 -J "${TASKS_ROOT}/build_vector_tiles/filter_intersections.json" /data/tiles/intersections.json
