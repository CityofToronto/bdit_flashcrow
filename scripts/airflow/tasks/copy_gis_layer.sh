#!/bin/bash

set -euo pipefail
GIT_ROOT=/home/ec2-user/flashcrow
TASKS_ROOT="${GIT_ROOT}/scripts/airflow/tasks"

BASE_URL="https://gis.toronto.ca/arcgis/rest/services"
TASK_ID="{{ task.task_id }}"
MAPSERVER_NAME="{{ params.mapserver_name }}"
LAYER_ID="{{ params.layer_id }}"

mkdir -p /data/gis_layers
python "${TASKS_ROOT}/lib/arcgis2pg.py" "${BASE_URL}" "${MAPSERVER_NAME}" "${LAYER_ID}" > "/data/gis_layers/${TASK_ID}.sql"
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 < "/data/gis_layers/${TASK_ID}.sql"
