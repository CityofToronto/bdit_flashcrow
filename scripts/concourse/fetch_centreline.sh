#!/bin/bash

set -eu

psql -U candu -h 10.160.12.47 -p 5432 bigdata \
  -c "COPY gis.centreline TO STDOUT (FORMAT text, ENCODING 'UTF8')" \
  > centreline/centreline.txt
psql -U candu -h 10.160.12.47 -p 5432 bigdata \
  -c "COPY gis.centreline_intersections TO STDOUT (FORMAT text, ENCODING 'UTF8')" \
  > centreline/centreline_intersections.txt

