#!/bin/bash

set -euo pipefail
GIT_ROOT=/home/ec2-user/flashcrow
TASKS_ROOT="${GIT_ROOT}/scripts/airflow/tasks"

mkdir -p /data/tiles
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -v datesFromInterval="'1 year'" -f "${TASKS_ROOT}/build_collisions_tiles/download_collisionsLevel3.sql" > /data/tiles/collisionsLevel3:1.json
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -v datesFromInterval="'3 year'" -f "${TASKS_ROOT}/build_collisions_tiles/download_collisionsLevel3.sql" > /data/tiles/collisionsLevel3:3.json
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -v datesFromInterval="'5 year'" -f "${TASKS_ROOT}/build_collisions_tiles/download_collisionsLevel3.sql" > /data/tiles/collisionsLevel3:5.json
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -v datesFromInterval="'10 year'" -f "${TASKS_ROOT}/build_collisions_tiles/download_collisionsLevel3.sql" > /data/tiles/collisionsLevel3:10.json

env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -v datesFromInterval="'1 year'" -f "${TASKS_ROOT}/build_collisions_tiles/download_collisionsLevel2.sql" > /data/tiles/collisionsLevel2:1.json
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -v datesFromInterval="'3 year'" -f "${TASKS_ROOT}/build_collisions_tiles/download_collisionsLevel2.sql" > /data/tiles/collisionsLevel2:3.json
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -v datesFromInterval="'5 year'" -f "${TASKS_ROOT}/build_collisions_tiles/download_collisionsLevel2.sql" > /data/tiles/collisionsLevel2:5.json
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -v datesFromInterval="'10 year'" -f "${TASKS_ROOT}/build_collisions_tiles/download_collisionsLevel2.sql" > /data/tiles/collisionsLevel2:10.json

tippecanoe --progress-interval=10 --force -o /data/tiles/collisionsLevel3:1.mbtiles -l collisionsLevel3:1 -Z10 -z16 --accumulate-attribute=heatmap_weight:sum --cluster-densest-as-needed -r1 /data/tiles/collisionsLevel3:1.json
tippecanoe --progress-interval=10 --force -o /data/tiles/collisionsLevel3:3.mbtiles -l collisionsLevel3:3 -Z10 -z16 --accumulate-attribute=heatmap_weight:sum --cluster-densest-as-needed -r1 /data/tiles/collisionsLevel3:3.json
tippecanoe --progress-interval=10 --force -o /data/tiles/collisionsLevel3:5.mbtiles -l collisionsLevel3:5 -Z10 -z16 --accumulate-attribute=heatmap_weight:sum --cluster-densest-as-needed -r1 /data/tiles/collisionsLevel3:5.json
tippecanoe --progress-interval=10 --force -o /data/tiles/collisionsLevel3:10.mbtiles -l collisionsLevel3:10 -Z10 -z16 --accumulate-attribute=heatmap_weight:sum --cluster-densest-as-needed -r1 /data/tiles/collisionsLevel3:10.json

tippecanoe --progress-interval=10 --force -o /data/tiles/collisionsLevel2:1.mbtiles -l collisionsLevel2:1 -Z14 -z16 /data/tiles/collisionsLevel2:1.json
tippecanoe --progress-interval=10 --force -o /data/tiles/collisionsLevel2:3.mbtiles -l collisionsLevel2:3 -Z14 -z16 /data/tiles/collisionsLevel2:3.json
tippecanoe --progress-interval=10 --force -o /data/tiles/collisionsLevel2:5.mbtiles -l collisionsLevel2:5 -Z14 -z16 /data/tiles/collisionsLevel2:5.json
tippecanoe --progress-interval=10 --force -o /data/tiles/collisionsLevel2:10.mbtiles -l collisionsLevel2:10 -Z14 -z16 /data/tiles/collisionsLevel2:10.json
