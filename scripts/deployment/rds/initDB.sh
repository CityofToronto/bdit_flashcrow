#!/bin/bash
# manually start this command when create new AWS stack!!

set -e
set -o nounset

cd "$(dirname "$0")"
psql -h "$PGHOST" postgres flashcrow_dba -v flashcrowPassword="$FLASHCROW_PASSWORD" -v airflowPassword="$AIRFLOW_PASSWORD" -f ./createDB.sql
