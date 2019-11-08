#!/bin/bash

set -euo pipefail
GIT_ROOT=/home/ec2-user/flashcrow
TASKS_ROOT="${GIT_ROOT}/scripts/airflow/tasks"

env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 < "${TASKS_ROOT}/copy_centreline/copy_centreline.sql"

# TODO: re-enable when RDS access is unblocked
# pg_dump -U candu -h 10.160.12.47 -p 5432 -t "gis.centreline" -x --no-owner --clean --if-exists bigdata | env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1
# pg_dump -U candu -h 10.160.12.47 -p 5432 -t "gis.centreline_intersection" -x --no-owner --clean --if-exists bigdata | env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1
