#!/bin/bash

set -euo pipefail

GIT_ROOT=$(realpath "$(dirname "$0")"/../../..)
DB_SHUTDOWN_SCRIPT="${GIT_ROOT}/scripts/test/db/shutdown.sh"

# TODO: shutdown backend server?

"${DB_SHUTDOWN_SCRIPT}"
