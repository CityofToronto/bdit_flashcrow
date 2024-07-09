#!/bin/bash
#
# db-update.sh [--targetVersion TARGET_VERSION]
#
# Migrates the application database to the target version, applying up / down
# migration files as appropriate.
#
# If no target version is provided, or if the target version is negative, updates
# to the latest version.
#
# Note that we have disabled SC2086 (double-quotes around arguments) in several
# places, as we are intentionally expanding $PSQL_ARGS into separate arguments.

set -e
set -o nounset

PSQL_ARGS=
TARGET_VERSION="-1"
DIR_DB=

function parse_args {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --psqlArgs )
      PSQL_ARGS="$2"
      shift
      ;;
      --targetVersion )
      TARGET_VERSION="$2"
      shift
      ;;
      * )
      echo "Invalid argument $1!"
      exit 1
      ;;
    esac
    shift
  done
  if [ -z "$PSQL_ARGS" ]; then
    echo "PostgreSQL arguments required!"
    exit 1
  fi
}

parse_args "$@"

GIT_ROOT=$(realpath "$(dirname "$0")"/../..)
DIR_SCRIPTS="$GIT_ROOT/scripts"

if [[ "$DOCKER_RUNNING" == true ]]; then
  DIR_DB="."
else
  DIR_DB="$DIR_SCRIPTS/db"
fi

# install schema if necessary
# shellcheck disable=SC2086
if psql $PSQL_ARGS -tAc "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'APP_META' AND table_name = 'DB_UPDATE')" | grep f; then
  echo "Installing db-update metadata tables..."
  DB_UPDATE_SQL_FILE="$DIR_DB/db-update-install.sql"
  psql $PSQL_ARGS -f "$DB_UPDATE_SQL_FILE"
  if psql $PSQL_ARGS -tAc "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'APP_META' AND table_name = 'DB_UPDATE')" | grep f; then
    (>&2 echo "Failed to install db-update metadata tables!")
    exit 1
  fi
fi

# get current database version
# shellcheck disable=SC2086
CURRENT_VERSION=$(psql $PSQL_ARGS -tAc 'SELECT "currentVersion" from "APP_META"."DB_UPDATE"')

# figure out latest version
LATEST_VERSION=1
UP_SQL_FILE="$DIR_DB/schema-${LATEST_VERSION}.up.sql"
while [ -f "$UP_SQL_FILE" ]; do
  echo "$UP_SQL_FILE"
  ((LATEST_VERSION++))
  UP_SQL_FILE="$DIR_DB/schema-${LATEST_VERSION}.up.sql"
done
((LATEST_VERSION--))
echo "latest: $LATEST_VERSION"
if [ "$TARGET_VERSION" -lt "0" ] || [ "$TARGET_VERSION" -gt "$LATEST_VERSION" ]; then
  TARGET_VERSION="$LATEST_VERSION"
fi
echo "target: $TARGET_VERSION"

# run necessary migrations
if [ "$TARGET_VERSION" -gt "$CURRENT_VERSION" ]; then
  # upgrade database to target by applying "up" migrations
  for i in $(seq $((CURRENT_VERSION+1)) $TARGET_VERSION); do
    UP_SQL_FILE="$DIR_DB/schema-${i}.up.sql"
    echo "Applying upgrade migration: ${UP_SQL_FILE}..."
    # shellcheck disable=SC2086
    psql $PSQL_ARGS -f "$UP_SQL_FILE"
  done
  echo "Upgraded database to version ${TARGET_VERSION}."
elif [ "$TARGET_VERSION" -lt "$CURRENT_VERSION" ]; then
  # downgrade database to target by applying "down" migrations
  for i in $(seq "$CURRENT_VERSION" -1 $((TARGET_VERSION+1))); do
    DOWN_SQL_FILE="$DIR_DB/schema-${i}.down.sql"
    echo "Applying downgrade migration: ${DOWN_SQL_FILE}..."
    # shellcheck disable=SC2086
    psql $PSQL_ARGS -f "$DOWN_SQL_FILE"
  done
  echo "Downgraded database to version ${TARGET_VERSION}."
else
  # no action
  echo "Already at target version: ${TARGET_VERSION}."
fi
