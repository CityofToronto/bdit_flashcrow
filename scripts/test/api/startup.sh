#!/bin/bash

set -euo pipefail

GIT_ROOT=$(realpath "$(dirname "$0")"/../../..)
DB_STARTUP_SCRIPT="${GIT_ROOT}/scripts/test/db/startup.sh"
PID_FILE="${GIT_ROOT}/scripts/test/api/.pid"

"${DB_STARTUP_SCRIPT}" --withDevData

rm -f "${PID_FILE}"

if ! lsof -t -i :8080 -s TCP:LISTEN; then
  echo "backend not running, starting new instance..."
  npm run backend:test-api > /dev/null 2>&1 &
  while ! lsof -t -i :8080 -s TCP:LISTEN; do
    echo "waiting for backend..."
    sleep 1
  done
  lsof -t -i :8080 -s TCP:LISTEN > "${PID_FILE}"
  echo "backend started."
fi
