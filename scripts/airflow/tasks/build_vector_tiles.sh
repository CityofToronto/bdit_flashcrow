#!/bin/bash

set -eu

"cd $(dirname "$0")"/build_vector_tiles

FC_PSQL_ARGS="-U flashcrow -h fr194ibxx9jxbj3.ccca5v4b7zsj.us-east-1.rds.amazonaws.com -p 5432 flashcrow"

# shellcheck disable=SC2086
psql $FC_PSQL_ARGS -f download_centreline.sql > centreline.json

# shellcheck disable=SC2086
psql $FC_PSQL_ARGS -f download_centreline_intersection.sql > centreline_intersection.json

tippecanoe --force -o centreline.mbtiles -Z10 -z19 -J filter_centreline.json -x ADDRESS_L -x ADDRESS_R -x LFN_ID -x OBJECTID -x FCODE_DESC -x JURIS_CODE centreline.json
tippecanoe --force -o intersections.mbtiles -Z13 -z19 -J filter_intersections.json -x CLASSIFI7 -x ELEVATIO10 -x ELEVATIO13 -x HEIGHT_R14 -x HEIGHT_R15 -x X -x Y -x OBJECTID centreline_intersection.json
