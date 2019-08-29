#!/bin/bash

set -euo pipefail

GIT_ROOT=$(realpath "$(dirname "$0")"/../../..)
DB_STARTUP_SCRIPT="${GIT_ROOT}/scripts/test/db/startup.sh"

"${DB_STARTUP_SCRIPT}" --withDevData

# TODO: actually start servers if not running?

if ! lsof -t -i :8080 -s TCP:LISTEN; then
  echo "backend not running!"
  exit 1
fi
