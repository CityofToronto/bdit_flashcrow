#!/bin/bash

set -eu

amazon-linux-extras enable postgresql9.6
yum clean metadata
yum install -y postgresql

echo "$PGPASS" > "$HOME/.pgpass"
chmod 0600 "$HOME/.pgpass"

psql -U candu -h 10.160.12.47 -p 5432 bigdata \
  -c "COPY gis.centreline TO STDOUT (FORMAT text, ENCODING 'UTF8')" \
  > centreline/centreline.txt
psql -U candu -h 10.160.12.47 -p 5432 bigdata \
  -c "COPY gis.centreline_intersection TO STDOUT (FORMAT text, ENCODING 'UTF8')" \
  > centreline/centreline_intersection.txt
