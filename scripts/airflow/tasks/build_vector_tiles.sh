#!/bin/bash

set -euo pipefail
GIT_ROOT=/home/ec2-user/flashcrow
TASKS_ROOT="${GIT_ROOT}/scripts/airflow/tasks"

mkdir -p /data/tiles
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -f "${TASKS_ROOT}/build_vector_tiles/download_midblocks.sql" > /data/tiles/midblocks.json
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -f "${TASKS_ROOT}/build_vector_tiles/download_intersections.sql" > /data/tiles/intersections.json

tippecanoe --force -o /data/tiles/midblocks.mbtiles -l midblocks -Z10 -z19 -J "${TASKS_ROOT}/build_vector_tiles/filter_midblocks.json" -x ADDRESS_L -x ADDRESS_R -x LFN_ID -x OBJECTID -x FCODE_DESC -x JURIS_CODE /data/tiles/midblocks.json
tippecanoe --force -o /data/tiles/intersections.mbtiles -l intersections -Z14 -z19 -J "${TASKS_ROOT}/build_vector_tiles/filter_intersections.json" -x CLASSIFI7 -x ELEVATIO10 -x ELEVATIO13 -x HEIGHT_R14 -x HEIGHT_R15 -x X -x Y -x OBJECTID /data/tiles/intersections.json
