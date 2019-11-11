#!/bin/bash

set -euo pipefail
GIT_ROOT=/home/ec2-user/flashcrow
TASKS_ROOT="${GIT_ROOT}/scripts/airflow/tasks"

# TODO: re-enable when RDS access is unblocked
# env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 < "${TASKS_ROOT}/copy_collision_factors/copy_collision_factors.sql"

# TODO: re-enable when RDS access is unblocked
# pg_dump -U candu -h 10.160.12.47 -p 5432 -t "collision_factors.loccoord" -x --no-owner --clean --if-exists bigdata | env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1
# pg_dump -U candu -h 10.160.12.47 -p 5432 -t "collision_factors.acclass" -x --no-owner --clean --if-exists bigdata | env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1
# pg_dump -U candu -h 10.160.12.47 -p 5432 -t "collision_factors.accloc" -x --no-owner --clean --if-exists bigdata | env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1
# pg_dump -U candu -h 10.160.12.47 -p 5432 -t "collision_factors.impactype" -x --no-owner --clean --if-exists bigdata | env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1
# pg_dump -U candu -h 10.160.12.47 -p 5432 -t "collision_factors.visible" -x --no-owner --clean --if-exists bigdata | env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1
# pg_dump -U candu -h 10.160.12.47 -p 5432 -t "collision_factors.light" -x --no-owner --clean --if-exists bigdata | env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1
# pg_dump -U candu -h 10.160.12.47 -p 5432 -t "collision_factors.rdsfcond" -x --no-owner --clean --if-exists bigdata | env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1
