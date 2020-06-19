#!/bin/bash

set -euo pipefail
GIT_ROOT=/home/ec2-user/flashcrow
TASKS_ROOT="${GIT_ROOT}/scripts/airflow/tasks"
AADT_CSV=/data/aadt_volume/volume_aadt.csv
AADT_SQL=/data/aadt_volume/volume_aadt.sql

mkdir -p /data/aadt_volume
{
  cat "${TASKS_ROOT}/centreline_vector_tiles/load_volume/load_volume_table.sql"
  echo 'COPY volume_new.aadt_raw FROM stdin WITH (FORMAT csv, HEADER TRUE);'
  cat "${AADT_CSV}"
  echo '\.'
  cat "${TASKS_ROOT}/centreline_vector_tiles/load_volume/load_volume_view.sql"
} > "${AADT_SQL}"

# shellcheck disable=SC2046
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 < "${AADT_SQL}"
