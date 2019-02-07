#!/bin/bash
#
# replicator-transfer.sh \
#   --config CONFIG \
#   --guid GUID \
#   --targetDb TARGET_DB \
#   --targetSchema TARGET_SCHEMA \
#   --targetValidationSchema TARGET_VALIDATION_SCHEMA
#
# Finishes the replication job with ID $GUID and configuration profile $CONFIG,
# using $TARGET_VALIDATION_SCHEMA in $TARGET_DB to validate before running
# ALTER TABLE ... SET SCHEMA $TARGET_SCHEMA to quickly cut over to the new
# data.  With this strategy, we can verify the data before it goes live, and
# effective downtime is on the order of seconds even for the largest tables.
#
# This is invoked on EC2 by replicator-local.ps1 via ssh, after that script has
# built the data tarball and copied it over to EC2.
#
# Note that we have disabled SC2086 (double-quotes around arguments) in several
# places, as we are intentionally expanding $PSQL_ARGS into separate arguments.

set -e
set -o nounset

CONFIG=
GUID=
TARGET_DB=
TARGET_SCHEMA=
TARGET_VALIDATION_SCHEMA=

function parse_args {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --config )
      CONFIG="$2"
      shift
      ;;
      --guid )
      GUID="$2"
      shift
      ;;
      --targetDb )
      TARGET_DB="$2"
      shift
      ;;
      --targetSchema )
      TARGET_SCHEMA="$2"
      shift
      ;;
      --targetValidationSchema )
      TARGET_VALIDATION_SCHEMA="$2"
      shift
      ;;
      * )
      echo "Invalid argument $1!"
      exit 1
      ;;
    esac
    shift
  done

  if [[ -z "$CONFIG" ]]; then
    echo "Config file required!"
    exit 1
  fi
  if [[ -z "$GUID" ]]; then
    echo "GUID required!"
    exit 1
  fi
  if [[ -z "$TARGET_DB" ]]; then
    echo "Target database connection string required!"
    exit 1
  fi
  if [[ -z "$TARGET_SCHEMA" ]]; then
    echo "Target schema required!"
    exit 1
  fi
  if [[ -z "$TARGET_VALIDATION_SCHEMA" ]]; then
    echo "Target validation schema required!"
    exit 1
  fi
}

parse_args "$@"
DIR_ROOT="flashcrow-$CONFIG"
DIR_ORA_CNT="$DIR_ROOT/ora_cnt"
DIR_PG="$DIR_ROOT/pg"
DIR_DAT="$DIR_ROOT/dat"
CONFIG_FILE="$CONFIG.config.json"
PG_DATA_ARCHIVE="flashcrow-$CONFIG.tar.gz"

function sendStatus {
  local -r MESSAGE="$1"
  local -r NOW=$(date --iso-8601="ns")
  echo "$GUID $NOW $MESSAGE"
}

function exitError {
  local -r MESSAGE="$1"
  local -r NOW=$(date --iso-8601="ns")
  (>&2 echo "$GUID $NOW $MESSAGE")
  exit 1
}

function exitSuccess {
  local -r MESSAGE="$1"
  local -r NOW=$(date --iso-8601="ns")
  echo "$GUID $NOW $MESSAGE"
  exit 0
}

sendStatus "Starting remote PostgreSQL data transfer..."

# cleanup previous data, unpack archive
cd "$HOME"
rm -rf "$DIR_ROOT"
tar xzvf "$PG_DATA_ARCHIVE"
sendStatus "$GUID Unpacked data archive on transfer machine..."

# drop any existing validation schema tables in reverse order
# shellcheck disable=SC2086
jq -r ".tables | reverse | .[]" "$CONFIG_FILE" | while read -r table; do
  psql $TARGET_DB -c "DROP TABLE IF EXISTS \"$TARGET_VALIDATION_SCHEMA\".\"$table\""
  if psql $TARGET_DB -tAc "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = '$TARGET_VALIDATION_SCHEMA' AND table_name = '$table')" | grep t; then
    exitError "Failed to drop $TARGET_VALIDATION_SCHEMA.$table from remote PostgreSQL!"
  fi
done

# run PostgreSQL schemas to create tables in validation schema
# shellcheck disable=SC2086
jq -r ".tables[]" "$CONFIG_FILE" | while read -r table; do
  PG_SQL_FILE="$DIR_PG/$table.sql"
  psql $TARGET_DB -f "$PG_SQL_FILE"
  if psql $TARGET_DB -tAc "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = '$TARGET_VALIDATION_SCHEMA' AND table_name = '$table')" | grep f; then
    exitError "Failed to create $TARGET_VALIDATION_SCHEMA.$table in remote PostgreSQL!"
  fi
done
sendStatus "Created remote PostgreSQL validation tables..."

# copy data from local text files to tables in validation schema
# shellcheck disable=SC2086
jq -r ".tables[]" "$CONFIG_FILE" | while read -r table; do
  DAT_FILE="$DIR_DAT/$table.dat"
  psql $TARGET_DB -c "\COPY \"$TARGET_VALIDATION_SCHEMA\".\"$table\" FROM STDIN (FORMAT text, ENCODING 'UTF8')" < "$DAT_FILE"

  # check row count
  PG_COUNT=$(psql $TARGET_DB -tAc "SELECT COUNT(*) FROM \"$TARGET_VALIDATION_SCHEMA\".\"$table\"")
  ORA_COUNT=$(cat "$DIR_ORA_CNT/$table.cnt")
  if [ "$PG_COUNT" != "$ORA_COUNT" ]; then
    exitError "Row count mismatch on $TARGET_VALIDATION_SCHEMA.$table: Oracle ($ORA_COUNT rows) -> PostgreSQL ($PG_COUNT rows)!"
  fi
  sendStatus "Validated $TARGET_VALIDATION_SCHEMA.$table..."
done
sendStatus "Copied data into remote PostgreSQL validation schema..."

# drop any existing target schema tables in reverse order
# shellcheck disable=SC2086
jq -r ".tables | reverse | .[]" "$CONFIG_FILE" | while read -r table; do
  psql $TARGET_DB -c "DROP TABLE IF EXISTS \"$TARGET_SCHEMA\".\"$table\""
  if psql $TARGET_DB -tAc "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = '$TARGET_SCHEMA' AND table_name = '$table')" | grep t; then
    exitError "Failed to drop $TARGET_SCHEMA.$table from remote PostgreSQL!"
  fi
done

# move tables from validation schema to target schema
# shellcheck disable=SC2086
jq -r ".tables[]" "$CONFIG_FILE" | while read -r table; do
  psql $TARGET_DB -c "ALTER TABLE \"$TARGET_VALIDATION_SCHEMA\".\"$table\" SET SCHEMA \"$TARGET_SCHEMA\""
  if psql $TARGET_DB -tAc "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = '$TARGET_SCHEMA' AND table_name = '$table')" | grep f; then
    exitError "Failed to move $TARGET_VALIDATION_SCHEMA.$table -> $TARGET_SCHEMA.$table in remote PostgreSQL!"
  fi
done
sendStatus "Moved tables to remote PostgreSQL target schema..."
exitSuccess "Finished remote PostgreSQL data transfer."
