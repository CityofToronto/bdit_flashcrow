#!/bin/bash

set -euo pipefail
GIT_ROOT=/home/ec2-user/flashcrow
TASKS_ROOT="${GIT_ROOT}/scripts/airflow/tasks"
MANUAL_CORR_SQL=/data/conflate_artery_centreline/A4_arteries_manual_corr.sql

mkdir -p /data/conflate_artery_centreline
curl -s https://raw.githubusercontent.com/CityofToronto/bdit_volumes/master/volume_project/flow_data_processing/arterycode_mapping/Artery%20Match%20Correction%20Files/all_corrections.csv > /data/conflate_artery_centreline/all_corrections.csv

{
  cat "${TASKS_ROOT}/conflate_artery_centreline/manual_corr/arteries_table.sql"
  echo 'COPY "counts_new"."arteries_manual_corr" FROM stdin WITH (FORMAT csv, HEADER TRUE);'
  cat /data/conflate_artery_centreline/all_corrections.csv
  echo '\.'
  cat "${TASKS_ROOT}/conflate_artery_centreline/manual_corr/arteries_view.sql"
} > "${MANUAL_CORR_SQL}"

# shellcheck disable=SC2046
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 < "${MANUAL_CORR_SQL}"
