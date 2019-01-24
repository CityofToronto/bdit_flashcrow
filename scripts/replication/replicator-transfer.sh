#!/bin/bash

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

function notifyStatus {
  local MESSAGE="$1"
  local NOW=$(date --iso-8601="ns")
  echo "$GUID $NOW $MESSAGE"
}

function stopWithError {
  local MESSAGE="$1"
  local NOW=$(date --iso-8601="ns")
  (>&2 echo "$GUID $NOW $MESSAGE")
  exit 1
}

function stopWithSuccess {
  local MESSAGE="$1"
  local NOW=$(date --iso-8601="ns")
  echo "$GUID $NOW $MESSAGE"
  exit 0
}

notifyStatus "Starting remote PostgreSQL data transfer..."

# cleanup previous data, unpack archive
cd $HOME
rm -rf "$DIR_ROOT"
tar xzvf "$PG_DATA_ARCHIVE"
notifyStatus "$GUID Unpacked data archive on transfer machine..."

# drop any existing validation schema tables in reverse order
jq -r ".tables[]" "$CONFIG_FILE" | tac | while read -r table; do
  psql $TARGET_DB -c "DROP TABLE IF EXISTS \"$TARGET_VALIDATION_SCHEMA\".\"$table\""
  if psql $TARGET_DB -tAc "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = '$TARGET_VALIDATION_SCHEMA' AND table_name = '$table')" | grep t; then
    stopWithError "Failed to drop $TARGET_VALIDATION_SCHEMA.$table from remote PostgreSQL!"
  fi
done

# run PostgreSQL schemas to create tables in validation schema
jq -r ".tables[]" "$CONFIG_FILE" | while read -r table; do
  PG_SQL_FILE="$DIR_PG/$table.sql"
  psql $TARGET_DB -f "$PG_SQL_FILE"
  if psql $TARGET_DB -tAc "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = '$TARGET_VALIDATION_SCHEMA' AND table_name = '$table')" | grep f; then
    stopWithError "Failed to create $TARGET_VALIDATION_SCHEMA.$table in remote PostgreSQL!"
  fi
done
notifyStatus "Created remote PostgreSQL validation tables..."

# copy data from local text files to tables in validation schema
jq -r ".tables[]" "$CONFIG_FILE" | while read -r table; do
  DAT_FILE="$DIR_DAT/$table.dat"
  psql $TARGET_DB -c "\COPY \"$TARGET_VALIDATION_SCHEMA\".\"$table\" FROM STDIN (FORMAT text, ENCODING 'UTF8')" < "$DAT_FILE"

  # check row count
  PG_COUNT=$(psql $TARGET_DB -tAc "SELECT COUNT(*) FROM \"$TARGET_VALIDATION_SCHEMA\".\"$table\"")
  ORA_COUNT=$(cat "$DIR_ORA_CNT/$table.cnt")
  if [ "$PG_COUNT" != "$ORA_COUNT" ]; then
    stopWithError "Row count mismatch on $TARGET_VALIDATION_SCHEMA.$table: Oracle ($ORA_COUNT rows) -> PostgreSQL ($PG_COUNT rows)!"
  fi
  notifyStatus "Validated $TARGET_VALIDATION_SCHEMA.$table..."
done
notifyStatus "Copied data into remote PostgreSQL validation schema..."

# drop any existing target schema tables in reverse order
jq -r ".tables[]" "$CONFIG_FILE" | tac | while read -r table; do
  psql $TARGET_DB -c "DROP TABLE IF EXISTS \"$TARGET_SCHEMA\".\"$table\""
  if psql $TARGET_DB -tAc "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = '$TARGET_SCHEMA' AND table_name = '$table')" | grep t; then
    stopWithError "Failed to drop $TARGET_SCHEMA.$table from remote PostgreSQL!"
  fi
done

# move tables from validation schema to target schema
jq -r ".tables[]" "$CONFIG_FILE" | while read -r table; do
  psql $TARGET_DB -c "ALTER TABLE \"$TARGET_VALIDATION_SCHEMA\".\"$table\" SET SCHEMA \"$TARGET_SCHEMA\""
  if psql $TARGET_DB -tAc "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = '$TARGET_SCHEMA' AND table_name = '$table')" | grep f; then
    stopWithError "Failed to move $TARGET_VALIDATION_SCHEMA.$table -> $TARGET_SCHEMA.$table in remote PostgreSQL!"
  fi
done
notifyStatus "Moved tables to remote PostgreSQL target schema..."
stopWithSuccess "Finished remote PostgreSQL data transfer."
