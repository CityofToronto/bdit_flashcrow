#!/bin/bash
#
# startup.sh
#
# Used by `RestApiTestUtils.startup()` to initialize the environment for testing our
# REST API layer.  This environment consists of a testing database (see `../db` for
# relevant scripts), plus a "headless" version of our web application backend (i.e.
# without `webpack-dev-server` as a proxy in front of it).

set -euo pipefail

GIT_ROOT=$(realpath "$(dirname "$0")"/../../..)
DB_STARTUP_SCRIPT="${GIT_ROOT}/scripts/test/db/startup.sh"

# stores PID of headless backend
PID_FILE="${GIT_ROOT}/scripts/test/api/.pid"

# initialize testing database
"${DB_STARTUP_SCRIPT}" --withDevData

rm -f "${PID_FILE}"

# is there anything listening on port 8080?
if lsof -t -i :8080 -s TCP:LISTEN; then
  # if so, free up the port by killing that service
  #
  # During development, this is most often our `webpack-dev-server` frontend, which
  # we can safely kill to run this headless backend.  This could also be a previous
  # running instance of the headless backend, or even another web application server
  # entirely.
  echo "port 8080 in use, killing..."
  PID_PORT_8080=$(lsof -t -i :8080 -s TCP:LISTEN)
  kill "${PID_PORT_8080}"
fi

# start the headless backend on port 8080
echo "starting backend in API_TEST_HEADLESS mode..."
npm run backend:test-api > /dev/null 2>&1 &
# we don't have a nice version of `pg_ctl -w`, so we have to loop-wait
# for our backend to start
while ! lsof -t -i :8080 -s TCP:LISTEN; do
  echo "waiting for backend..."
  sleep 1
done
lsof -t -i :8080 -s TCP:LISTEN > "${PID_FILE}"
echo "backend started."
