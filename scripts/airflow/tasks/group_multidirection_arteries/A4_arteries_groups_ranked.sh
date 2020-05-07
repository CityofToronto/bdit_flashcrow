#!/bin/bash

set -euo pipefail
GIT_ROOT=/home/ec2-user/flashcrow
TASKS_ROOT="${GIT_ROOT}/scripts/airflow/tasks"

# shellcheck disable=SC2046
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 < "${TASKS_ROOT}/group_multidirection_arteries/A4_arteries_groups_ranked.sql"

mkdir -p /data/group_multidirection_arteries
# shellcheck disable=SC2046
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -c "COPY (SELECT * FROM counts.arteries_midblock_ranked_pairs ORDER BY geo_id ASC, score DESC) TO stdout (FORMAT csv, HEADER true, ENCODING 'UTF-8')" > /data/group_multidirection_arteries/arteries_midblock_ranked_pairs.csv

python "${TASKS_ROOT}/group_multidirection_arteries/a4_arteries_groups_ranked.py" < /data/group_multidirection_arteries/arteries_midblock_ranked_pairs.csv > /data/group_multidirection_arteries/arteries_midblock_ranked_pairs_greedy.sql

# shellcheck disable=SC2046
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 < /data/group_multidirection_arteries/arteries_midblock_ranked_pairs_greedy.sql
