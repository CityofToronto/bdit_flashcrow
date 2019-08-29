#!/bin/bash

set -euo pipefail

GIT_ROOT=$(realpath "$(dirname "$0")"/../../..)
DB_SHUTDOWN_SCRIPT="${GIT_ROOT}/scripts/test/db/shutdown.sh"
PID_FILE="${GIT_ROOT}/scripts/test/api/.pid"

if [ -f "${PID_FILE}" ]; then
  BACKEND_PID=$(cat "${PID_FILE}")
  kill "${BACKEND_PID}"
  rm "${PID_FILE}"
fi

"${DB_SHUTDOWN_SCRIPT}"
