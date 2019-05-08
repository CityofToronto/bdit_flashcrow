#!/bin/bash

set -eu
cd $(dirname $0)

psql -v ON_ERROR_STOP=1 -U flashcrow -h fr194ibxx9jxbj3.ccca5v4b7zsj.us-east-1.rds.amazonaws.com -p 5432 flashcrow < build_artery_centreline/build_artery_centreline.sql
