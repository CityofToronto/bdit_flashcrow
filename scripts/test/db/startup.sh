#!/bin/bash
#
# startup.sh [--withDevData]
#
# This is called by `npm run test:db-startup` to initialize a PostgreSQL database that
# is specifically designed for testing.  This database resides on an in-memory filesystem
# that is unmounted at end of test.

set -euo pipefail

# Path to development data file.
FLASHCROW_DEV_DATA="$HOME/flashcrow-dev-data.sql"
GIT_ROOT=$(realpath "$(dirname "$0")"/../../..)

# Directory under `/mnt` that is used for our in-memory filesystem.
RAMDISK_NAME=ramdisk_move_test
RAMDISK_MOUNT_POINT=/mnt/${RAMDISK_NAME}

# Used to store the device identifier for easy unmounting later.
RAMDISK_DEVICE_FILE="${RAMDISK_MOUNT_POINT}/.device"

# This file is used by `initdb` to initialize the PostgreSQL admin password.
RAMDISK_PWFILE="${RAMDISK_MOUNT_POINT}/.pwfile"

# This file is used by `psql`, `pg-promise` to load database credentials.
RAMDISK_PGPASS="${RAMDISK_MOUNT_POINT}/.pgpass"

# This directory stores database data.
RAMDISK_DATA_DIR="${RAMDISK_MOUNT_POINT}/pg_data_dir"

if [ ! -f "${FLASHCROW_DEV_DATA}" ]; then
  # TODO: in this case, we should scp it from ETL directly!
  # However, that requires the SSH key to be provided.
  echo "cannot find ${FLASHCROW_DEV_DATA}; did you copy it from ETL?"
  exit 1
fi

# cleanup existing ramdisk (if any), in case `shutdown.sh` wasn't run (e.g.
# test was killed before it could tear down properly)
if [ -f "$RAMDISK_DEVICE_FILE" ]; then
  echo "Device file $RAMDISK_DEVICE_FILE found; shutting down existing instance..."
  "$(dirname "$0")"/shutdown.sh
fi

# create ramdisk using diskutil
echo "Creating ramdisk..."
sudo mkdir ${RAMDISK_MOUNT_POINT}
RAMDISK_DEVICE=$(sudo mount -t tmpfs -o size=2g tmpfs ${RAMDISK_MOUNT_POINT})
echo "$RAMDISK_DEVICE" | sudo tee ${RAMDISK_DEVICE_FILE}

# give 'vagrant' user/group ownership of the RAM-disk folder.
sudo chown -R "${USER}:${USER}" ${RAMDISK_MOUNT_POINT}
sudo chown -R "${USER}:${USER}" /var/run/postgresql/
mkdir ${RAMDISK_DATA_DIR}
chmod -R g+rw ${RAMDISK_MOUNT_POINT}
touch "${RAMDISK_PGPASS}"
chmod 0600 "${RAMDISK_PGPASS}"

# generate secure random admin password using `openssl`
echo "Generating PostgreSQL admin password..."
PG_ADMIN_PASSWORD=$(openssl rand -base64 32)
echo "${PG_ADMIN_PASSWORD}" > ${RAMDISK_PWFILE}
echo "localhost:5433:postgres:flashcrow_dba:${PG_ADMIN_PASSWORD}" >> ${RAMDISK_PGPASS}

# install PostgreSQL database files with PostgreSQL utility `initdb`
echo "Installing PostgreSQL database files..."
initdb \
  -U flashcrow_dba \
  --pwfile ${RAMDISK_PWFILE} \
  -D ${RAMDISK_DATA_DIR}

# startup PostgreSQL
#
# NOTE: we use -F here to start PostgreSQL without fsync for test performance.
# Do NOT do this outside the test environment!  It *will* lead to unrecoverable
# data corruption.
#
# NOTE: we start this on port 5433 to avoid port collisions with the development
# PostgreSQL server.
echo "Starting PostgreSQL..."
pg_ctl \
  -D ${RAMDISK_DATA_DIR} \
  -l ${RAMDISK_MOUNT_POINT}/pg.${RAMDISK_NAME}.log \
  -o "-F -p 5433" \
  -w \
  start

# generate secure random user password using `openssl`, and write to `.pgpass`
echo "Generating PostgreSQL user password..."
PG_USER_PASSWORD=$(openssl rand -base64 32)
echo "localhost:5433:flashcrow:flashcrow:${PG_USER_PASSWORD}" >> ${RAMDISK_PGPASS}

# install MOVE database: we create the database with its own user, set up PostGIS extensions,
# and run any database migrations
echo "Setting up MOVE application database..."
psql -h localhost -p 5433 -U flashcrow_dba postgres -v pgPassword="'$PG_USER_PASSWORD'" < "${GIT_ROOT}/scripts/dev/provision-db-vagrant.sql"
psql -h localhost -p 5433 -U flashcrow flashcrow < "${GIT_ROOT}/scripts/deployment/rds/collision_factors.sql"
psql -h localhost -p 5433 -U flashcrow flashcrow < "${GIT_ROOT}/scripts/db/db-update-install.sql"
"${GIT_ROOT}/scripts/db/db-update.sh" --psqlArgs "-h localhost -p 5433 -U flashcrow flashcrow"

# load dev dataset as produced by our `dev_data` Airflow job
psql -h localhost -p 5433 -U flashcrow flashcrow < "${FLASHCROW_DEV_DATA}"

echo "Done."
