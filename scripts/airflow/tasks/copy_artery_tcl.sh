#!/bin/bash

set -euo pipefail
GIT_ROOT=/home/ec2-user/flashcrow
TASKS_ROOT="${GIT_ROOT}/scripts/airflow/tasks"

env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 < "${TASKS_ROOT}/copy_artery_tcl/copy_artery_tcl.sql"

# TODO: re-enable when RDS access is unblocked
# pg_dump -U candu -h 10.160.12.47 -p 5432 -t "prj_volume.artery_tcl" -x --no-owner --clean --if-exists bigdata | env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1
# psql -U candu -h 10.160.12.47 -p 5432 bigdata -c "COPY (SELECT * FROM prj_volume.artery_intersections) TO STDOUT (FORMAT text, ENCODING 'UTF-8')" | env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -c "COPY prj_volume.artery_intersections FROM STDIN (FORMAT text, ENCODING 'UTF-8')"
