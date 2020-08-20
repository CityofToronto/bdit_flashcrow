#!/bin/bash

set -euo pipefail
GIT_ROOT=/home/ec2-user/flashcrow
TASKS_ROOT="${GIT_ROOT}/scripts/airflow/tasks"
AUTOVACUUM_SQL=/data/autovacuum_cleanup/autovacuum_cleanup.sql

mkdir -p /data/autovacuum_cleanup
{
  # shellcheck disable=SC2046
  env $(xargs < /home/ec2-user/cot-env.config) psql -v ON_ERROR_STOP=1 -tAc "SELECT format('\"%s\".\"%s\"', schemaname, matviewname) FROM pg_matviews WHERE matviewowner = 'flashcrow'" | while read line; do
    echo "VACUUM ANALYZE ${line};"
  done
} > "${AUTOVACUUM_SQL}"

# shellcheck disable=SC2046
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 < "${AUTOVACUUM_SQL}"
