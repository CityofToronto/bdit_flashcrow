#!/bin/bash

set -euo pipefail
GIT_ROOT=/home/ec2-user/flashcrow
TASKS_ROOT="${GIT_ROOT}/scripts/airflow/tasks"

# shellcheck disable=SC2046
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 < "${TASKS_ROOT}/group_multiday_counts/A4_arteries_groups_ranked.sql"

mkdir -p /data/group_multiday_counts
# shellcheck disable=SC2046
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -c "COPY (SELECT * FROM counts.arteries_midblock_ranked_pairs ORDER BY geo_id ASC, score DESC) TO stdout (FORMAT csv, HEADER true, ENCODING 'UTF-8')" > /data/group_multiday_counts/arteries_midblock_ranked_pairs.csv

python "${TASKS_ROOT}/group_multiday_counts/a4_arteries_groups_ranked.py" < /data/group_multiday_counts/arteries_midblock_ranked_pairs.csv > /data/group_multiday_counts/arteries_midblock_ranked_pairs_greedy.sql

# shellcheck disable=SC2046
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 < /data/group_multiday_counts/arteries_midblock_ranked_pairs_greedy.sql
