#!/bin/bash

set -eu
cd $(dirname $0)/dump_dev_data

# create required schemas
cp create_schemas.sql flashcrow-dev-data.sql

# copy full tables
pg_dump -U flashcrow -h fr194ibxx9jxbj3.ccca5v4b7zsj.us-east-1.rds.amazonaws.com -p 5432 -t "gis.centreline" -t "gis.centreline_intersection" -t "prj_volume.artery_centreline" -t '"TRAFFIC"."CATEGORY"' -t '"TRAFFIC"."ARTERYDATA"' -x --no-owner --clean --if-exists flashcrow >> flashcrow-dev-data.sql

# copy schemas of sampled tables
pg_dump -U flashcrow -h fr194ibxx9jxbj3.ccca5v4b7zsj.us-east-1.rds.amazonaws.com -p 5432 -t '"TRAFFIC"."COUNTINFOMICS"' -t '"TRAFFIC"."DET"' -t '"TRAFFIC"."COUNTINFO"' -t '"TRAFFIC"."CNT_DET"' -t '"TRAFFIC"."CNT_SPD"' -x --no-owner --clean --if-exists --schema-only flashcrow >> flashcrow-dev-data.sql

# copy sampled table data from flashcrow_dev_data schema
echo 'COPY "TRAFFIC"."COUNTINFOMICS" FROM stdin;' >> flashcrow-dev-data.sql
psql -v ON_ERROR_STOP=1 -U flashcrow -h fr194ibxx9jxbj3.ccca5v4b7zsj.us-east-1.rds.amazonaws.com -p 5432 flashcrow -c "COPY (SELECT * FROM flashcrow_dev_data.traffic_countinfomics) TO stdout (FORMAT text, ENCODING 'UTF-8')" >> flashcrow-dev-data.sql
echo '\.' >> flashcrow-dev-data.sql

echo 'COPY "TRAFFIC"."DET" FROM stdin;' >> flashcrow-dev-data.sql
psql -v ON_ERROR_STOP=1 -U flashcrow -h fr194ibxx9jxbj3.ccca5v4b7zsj.us-east-1.rds.amazonaws.com -p 5432 flashcrow -c "COPY (SELECT * FROM flashcrow_dev_data.traffic_det) TO stdout (FORMAT text, ENCODING 'UTF-8')" >> flashcrow-dev-data.sql
echo '\.' >> flashcrow-dev-data.sql

echo 'COPY "TRAFFIC"."COUNTINFO" FROM stdin;' >> flashcrow-dev-data.sql
psql -v ON_ERROR_STOP=1 -U flashcrow -h fr194ibxx9jxbj3.ccca5v4b7zsj.us-east-1.rds.amazonaws.com -p 5432 flashcrow -c "COPY (SELECT * FROM flashcrow_dev_data.traffic_countinfo) TO stdout (FORMAT text, ENCODING 'UTF-8')" >> flashcrow-dev-data.sql
echo '\.' >> flashcrow-dev-data.sql

echo 'COPY "TRAFFIC"."CNT_DET" FROM stdin;' >> flashcrow-dev-data.sql
psql -v ON_ERROR_STOP=1 -U flashcrow -h fr194ibxx9jxbj3.ccca5v4b7zsj.us-east-1.rds.amazonaws.com -p 5432 flashcrow -c "COPY (SELECT * FROM flashcrow_dev_data.traffic_cnt_det) TO stdout (FORMAT text, ENCODING 'UTF-8')" >> flashcrow-dev-data.sql
echo '\.' >> flashcrow-dev-data.sql

echo 'COPY "TRAFFIC"."CNT_SPD" FROM stdin;' >> flashcrow-dev-data.sql
psql -v ON_ERROR_STOP=1 -U flashcrow -h fr194ibxx9jxbj3.ccca5v4b7zsj.us-east-1.rds.amazonaws.com -p 5432 flashcrow -c "COPY (SELECT * FROM flashcrow_dev_data.traffic_cnt_spd) TO stdout (FORMAT text, ENCODING 'UTF-8')" >> flashcrow-dev-data.sql
echo '\.' >> flashcrow-dev-data.sql
