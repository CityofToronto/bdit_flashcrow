#!/bin/bash

set -euo pipefail
GIT_ROOT=/home/ec2-user/flashcrow
TASKS_ROOT="${GIT_ROOT}/scripts/airflow/tasks"

mkdir -p /data/tiles
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -f "${TASKS_ROOT}/build_collisions_tiles/download_collisions_heatmap.sql" > /data/tiles/collisions-heatmap.json
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -f "${TASKS_ROOT}/build_collisions_tiles/download_collisions.sql" > /data/tiles/collisions.json

tippecanoe --force -o /data/tiles/collisions-heatmap.mbtiles --accumulate-attribute=heatmap_weight:sum --cluster-densest-as-needed -r1 -Z10 -z15 /data/tiles/collisions-heatmap.json
tippecanoe --force -o /data/tiles/collisions.mbtiles -Z16 -z17 /data/tiles/collisions.json
