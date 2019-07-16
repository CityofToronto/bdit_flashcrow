#!/bin/bash

set -eu
# shellcheck disable=SC2046
# shellcheck disable=SC2086
cd $(dirname $0)


psql -v ON_ERROR_STOP=1 -U flashcrow -h fr194ibxx9jxbj3.ccca5v4b7zsj.us-east-1.rds.amazonaws.com -p 5432 flashcrow < copy_collision_factors/copy_collision_factors.sql

pg_dump -U candu -h 10.160.12.47 -p 5432 -t "collision_factors.loccoord" -x --no-owner --clean --if-exists bigdata | psql -v ON_ERROR_STOP=1 -U flashcrow -h fr194ibxx9jxbj3.ccca5v4b7zsj.us-east-1.rds.amazonaws.com -p 5432 flashcrow

pg_dump -U candu -h 10.160.12.47 -p 5432 -t "collision_factors.acclass" -x --no-owner --clean --if-exists bigdata | psql -v ON_ERROR_STOP=1 -U flashcrow -h fr194ibxx9jxbj3.ccca5v4b7zsj.us-east-1.rds.amazonaws.com -p 5432 flashcrow

pg_dump -U candu -h 10.160.12.47 -p 5432 -t "collision_factors.accloc" -x --no-owner --clean --if-exists bigdata | psql -v ON_ERROR_STOP=1 -U flashcrow -h fr194ibxx9jxbj3.ccca5v4b7zsj.us-east-1.rds.amazonaws.com -p 5432 flashcrow

pg_dump -U candu -h 10.160.12.47 -p 5432 -t "collision_factors.impactype" -x --no-owner --clean --if-exists bigdata | psql -v ON_ERROR_STOP=1 -U flashcrow -h fr194ibxx9jxbj3.ccca5v4b7zsj.us-east-1.rds.amazonaws.com -p 5432 flashcrow

pg_dump -U candu -h 10.160.12.47 -p 5432 -t "collision_factors.visible" -x --no-owner --clean --if-exists bigdata | psql -v ON_ERROR_STOP=1 -U flashcrow -h fr194ibxx9jxbj3.ccca5v4b7zsj.us-east-1.rds.amazonaws.com -p 5432 flashcrow

pg_dump -U candu -h 10.160.12.47 -p 5432 -t "collision_factors.light" -x --no-owner --clean --if-exists bigdata | psql -v ON_ERROR_STOP=1 -U flashcrow -h fr194ibxx9jxbj3.ccca5v4b7zsj.us-east-1.rds.amazonaws.com -p 5432 flashcrow

pg_dump -U candu -h 10.160.12.47 -p 5432 -t "collision_factors.rdsfcond" -x --no-owner --clean --if-exists bigdata | psql -v ON_ERROR_STOP=1 -U flashcrow -h fr194ibxx9jxbj3.ccca5v4b7zsj.us-east-1.rds.amazonaws.com -p 5432 flashcrow