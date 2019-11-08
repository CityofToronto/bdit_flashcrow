#!/bin/bash

set -euo pipefail
cd $(dirname $0)

env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 < copy_centreline/copy_centreline.sql
# re-enable when RDS access is unblocked
# pg_dump -U candu -h 10.160.12.47 -p 5432 -t "gis.centreline" -x --no-owner --clean --if-exists bigdata | env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1
# pg_dump -U candu -h 10.160.12.47 -p 5432 -t "gis.centreline_intersection" -x --no-owner --clean --if-exists bigdata | env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1
