#!/bin/bash
# manually start this command when create new AWS stack!!

set -e
set -o nounset

cd "$(dirname "$0")"
psql -h fr194ibxx9jxbj3.ccca5v4b7zsj.us-east-1.rds.amazonaws.com postgres flashcrow_dba -v flashcrowPassword="$FLASHCROW_PASSWORD" -v airflowPassword="$AIRFLOW_PASSWORD" -f ./createDB.sql
