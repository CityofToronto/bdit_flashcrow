#!/bin/bash

set -euo pipefail
GIT_ROOT=/home/ec2-user/flashcrow
TASKS_ROOT="${GIT_ROOT}/scripts/airflow/tasks"

mkdir -p /data/tiles
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -f "${TASKS_ROOT}/build_vector_tiles/download_centreline.sql" > /data/tiles/centreline.json
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -f "${TASKS_ROOT}/build_vector_tiles/download_centreline_intersection.sql" > /data/tiles/centreline_intersection.json

tippecanoe --force -o /data/tiles/centreline.mbtiles -Z10 -z19 -J "${TASKS_ROOT}/build_vector_tiles/filter_centreline.json" -x ADDRESS_L -x ADDRESS_R -x LFN_ID -x OBJECTID -x FCODE_DESC -x JURIS_CODE /data/tiles/centreline.json
tippecanoe --force -o /data/tiles/intersections.mbtiles -Z13 -z19 -J "${TASKS_ROOT}/build_vector_tiles/filter_intersections.json" -x CLASSIFI7 -x ELEVATIO10 -x ELEVATIO13 -x HEIGHT_R14 -x HEIGHT_R15 -x X -x Y -x OBJECTID /data/tiles/centreline_intersection.json
