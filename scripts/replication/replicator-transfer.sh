#!/bin/bash

set -e
set -o nounset

CONFIG=
TARGET_DB=
TARGET_SCHEMA=
TARGET_VALIDATION_SCHEMA=
DIR_ROOT="flashcrow"
DIR_PG="$DIR_ROOT/pg"
DIR_DAT="$DIR_ROOT/dat"
PG_DATA_ARCHIVE="flashcrow.tar.gz"

function parse_args {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --config )
      CONFIG="$2"
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
echo "Starting remote PostgreSQL data transfer..."

# cleanup previous data, unpack archive
cd $HOME
rm -rf "$DIR_ROOT"
tar xzvf "$PG_DATA_ARCHIVE"
echo "Unpacked data archive on transfer machine..."

# drop any existing validation schema tables in reverse order
jq -r ".tables[]" "$CONFIG" | tac | while read -r table; do
  psql $TARGET_DB -c "DROP TABLE IF EXISTS \"$TARGET_VALIDATION_SCHEMA\".\"$table\""
  if psql $TARGET_DB -tAc "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = '$TARGET_VALIDATION_SCHEMA' AND table_name = '$table')" | grep t; then
    echo "Failed to drop $TARGET_VALIDATION_SCHEMA.$table from remote PostgreSQL!"
    exit 1
  fi
done

# run PostgreSQL schemas to create tables in validation schema
jq -r ".tables[]" "$CONFIG" | while read -r table; do
  PG_SQL_FILE="$DIR_PG/$table.sql"
  psql $TARGET_DB -f "$PG_SQL_FILE"
  if psql $TARGET_DB -tAc "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = '$TARGET_VALIDATION_SCHEMA' AND table_name = '$table')" | grep f; then
    echo "Failed to create $TARGET_VALIDATION_SCHEMA.$table in remote PostgreSQL!"
    exit 1
  fi
done
echo "Created remote PostgreSQL validation tables..."

# copy data from local text files to tables
jq -r ".tables[]" "$CONFIG" | while read -r table; do
  DAT_FILE="$DIR_DAT/$table.dat"
  psql $TARGET_DB -c "\COPY \"$TARGET_VALIDATION_SCHEMA\".\"$table\" FROM STDIN (FORMAT text, ENCODING 'UTF8')" < "$DAT_FILE"
done
echo "Copied data into remote PostgreSQL validation schema..."

# TODO: validate counts against computed counts from local script
# TODO: other validation checks?

# drop any existing target schema tables in reverse order
jq -r ".tables[]" "$CONFIG" | tac | while read -r table; do
  psql $TARGET_DB -c "DROP TABLE IF EXISTS \"$TARGET_SCHEMA\".\"$table\""
  if psql $TARGET_DB -tAc "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = '$TARGET_SCHEMA' AND table_name = '$table')" | grep t; then
    echo "Failed to drop $TARGET_SCHEMA.$table from remote PostgreSQL!"
    exit 1
  fi
done

# move tables from validation schema to target schema
jq -r ".tables[]" "$CONFIG" | while read -r table; do
  psql $TARGET_DB -c "ALTER TABLE \"$TARGET_VALIDATION_SCHEMA\".\"$table\" SET SCHEMA \"$TARGET_SCHEMA\""
  if psql $TARGET_DB -tAc "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = '$TARGET_SCHEMA' AND table_name = '$table')" | grep f; then
    echo "Failed to move $TARGET_VALIDATION_SCHEMA.$table -> $TARGET_SCHEMA.$table in remote PostgreSQL!"
    exit 1
  fi
done
echo "Moved tables to remote PostgreSQL target schema..."
echo "Finished remote PostgreSQL data transfer."
