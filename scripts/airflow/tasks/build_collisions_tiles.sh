#!/bin/bash

set -euo pipefail
GIT_ROOT=/home/ec2-user/flashcrow
TASKS_ROOT="${GIT_ROOT}/scripts/airflow/tasks"

mkdir -p /data/tiles
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -f "${TASKS_ROOT}/build_collisions_tiles/download_collisionsLevel3.sql" > /data/tiles/collisionsLevel3.json
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -f "${TASKS_ROOT}/build_collisions_tiles/download_collisionsLevel2.sql" > /data/tiles/collisionsLevel2.json

tippecanoe --force -o /data/tiles/collisionsLevel3.mbtiles -l collisionsLevel3 -Z10 -z16 --accumulate-attribute=heatmap_weight:sum --cluster-densest-as-needed -r1 /data/tiles/collisionsLevel3.json
tippecanoe --force -o /data/tiles/collisionsLevel2.mbtiles -l collisionsLevel2 -Z14 -z16 /data/tiles/collisionsLevel2.json
