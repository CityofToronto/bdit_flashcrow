#!/bin/bash

set -eu
cd $(dirname $0)

psql -v ON_ERROR_STOP=1 -U flashcrow -h fr194ibxx9jxbj3.ccca5v4b7zsj.us-east-1.rds.amazonaws.com -p 5432 flashcrow < copy_artery_tcl/copy_artery_tcl.sql

# TODO: re-enable when RDS access is unblocked
# pg_dump -U candu -h 10.160.12.47 -p 5432 -t "prj_volume.artery_tcl" -x --no-owner --clean --if-exists bigdata | psql -v ON_ERROR_STOP=1 -U flashcrow -h fr194ibxx9jxbj3.ccca5v4b7zsj.us-east-1.rds.amazonaws.com -p 5432 flashcrow
# psql -U candu -h 10.160.12.47 -p 5432 bigdata -c "COPY (SELECT * FROM prj_volume.artery_intersections) TO STDOUT (FORMAT text, ENCODING 'UTF-8')" | psql -v ON_ERROR_STOP=1 -U flashcrow -h fr194ibxx9jxbj3.ccca5v4b7zsj.us-east-1.rds.amazonaws.com -p 5432 flashcrow -c "COPY prj_volume.artery_intersections FROM STDIN (FORMAT text, ENCODING 'UTF-8')"
