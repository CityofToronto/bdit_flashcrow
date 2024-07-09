#!/bin/bash
#
# db-new-migration-create.sh
#
# Creates forward and backward migration scripts for a new database schema version.

set -e
set -o nounset

GIT_ROOT=$(realpath "$(dirname "$0")"/../..)
DIR_SCRIPTS="$GIT_ROOT/scripts"
DIR_DB="$DIR_SCRIPTS/db"

# figure out next version
NEXT_VERSION=1
UP_SQL_FILE="$DIR_DB/schema-${NEXT_VERSION}.up.sql"
while [ -f "$UP_SQL_FILE" ]; do
  ((NEXT_VERSION++))
  UP_SQL_FILE="$DIR_DB/schema-${NEXT_VERSION}.up.sql"
done
# figure out latest version
LATEST_VERSION="$NEXT_VERSION"
((LATEST_VERSION--))

cat << EOF > "$DIR_DB/schema-${NEXT_VERSION}.up.sql"
BEGIN;

-- forward migration SQL goes here

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = $NEXT_VERSION;
COMMIT;
EOF

cat << EOF > "$DIR_DB/schema-${NEXT_VERSION}.down.sql"
BEGIN;

-- backward migration SQL goes here

UPDATE "APP_META"."DB_UPDATE" SET "currentVersion" = $LATEST_VERSION;
COMMIT;
EOF

git add "$DIR_DB/schema-${NEXT_VERSION}.up.sql" "$DIR_DB/schema-${NEXT_VERSION}.down.sql"
