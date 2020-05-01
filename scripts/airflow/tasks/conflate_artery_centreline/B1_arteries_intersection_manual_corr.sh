#!/bin/bash

set -euo pipefail
GIT_ROOT=/home/ec2-user/flashcrow
TASKS_ROOT="${GIT_ROOT}/scripts/airflow/tasks"
MANUAL_CORR_CSV="${TASKS_ROOT}/conflate_artery_centreline/manual_corr/arteries_intersection.csv"
MANUAL_CORR_SQL=/data/conflate_artery_centreline/B1_arteries_intersection_manual_corr.sql

mkdir -p /data/conflate_artery_centreline
cp "${TASKS_ROOT}/conflate_artery_centreline/manual_corr/arteries_intersection_table.sql" "${MANUAL_CORR_SQL}"

echo 'COPY "counts_new"."arteries_intersection_manual_corr" FROM stdin WITH (FORMAT csv, HEADER TRUE);' >> "${MANUAL_CORR_SQL}"
cat "${MANUAL_CORR_CSV}" >> "${MANUAL_CORR_SQL}"
echo '\.' >> "${MANUAL_CORR_SQL}"

cat "${TASKS_ROOT}/conflate_artery_centreline/manual_corr/arteries_intersection_view.sql" >> "${MANUAL_CORR_SQL}"

env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 < "${MANUAL_CORR_SQL}"
