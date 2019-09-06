#!/bin/bash
#
# startup.sh
#
# Used by `RestApiTestUtils.shutdown()` to tear down the environment for testing our
# REST API layer.  This environment consists of a testing database (see `../db` for
# relevant scripts), plus a "headless" version of our web application backend (i.e.
# without `webpack-dev-server` as a proxy in front of it).
set -euo pipefail

GIT_ROOT=$(realpath "$(dirname "$0")"/../../..)
DB_SHUTDOWN_SCRIPT="${GIT_ROOT}/scripts/test/db/shutdown.sh"

# stores PID of headless backend
PID_FILE="${GIT_ROOT}/scripts/test/api/.pid"

# kill headless backend if running
if [ -f "${PID_FILE}" ]; then
  BACKEND_PID=$(cat "${PID_FILE}")
  kill "${BACKEND_PID}"
  rm "${PID_FILE}"
fi

# shutdown testing database
"${DB_SHUTDOWN_SCRIPT}"
