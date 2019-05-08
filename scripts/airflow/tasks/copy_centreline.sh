#!/bin/bash

set -eu
cd $(dirname $0)

psql -v ON_ERROR_STOP=1 -U flashcrow -h fr194ibxx9jxbj3.ccca5v4b7zsj.us-east-1.rds.amazonaws.com -p 5432 flashcrow < copy_centreline/copy_centreline.sql
pg_dump -U candu -h 10.160.12.47 -p 5432 -t "gis.centreline" -x --no-owner --clean --if-exists bigdata | psql -v ON_ERROR_STOP=1 -U flashcrow -h fr194ibxx9jxbj3.ccca5v4b7zsj.us-east-1.rds.amazonaws.com -p 5432 flashcrow
pg_dump -U candu -h 10.160.12.47 -p 5432 -t "gis.centreline_intersection" -x --no-owner --clean --if-exists bigdata | psql -v ON_ERROR_STOP=1 -U flashcrow -h fr194ibxx9jxbj3.ccca5v4b7zsj.us-east-1.rds.amazonaws.com -p 5432 flashcrow
