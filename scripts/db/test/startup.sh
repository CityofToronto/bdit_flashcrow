#!/bin/bash

set -euo pipefail

FLASHCROW_DEV_DATA="$HOME/flashcrow-dev-data.sql"
GIT_ROOT=$(realpath "$(dirname "$0")"/../../..)
RAMDISK_NAME=ramdisk_move_test
RAMDISK_MOUNT_POINT=/mnt/${RAMDISK_NAME}
RAMDISK_DEVICE_FILE="${RAMDISK_MOUNT_POINT}/.device"
RAMDISK_PWFILE="${RAMDISK_MOUNT_POINT}/.pwfile"
RAMDISK_PGPASS="${RAMDISK_MOUNT_POINT}/.pgpass"
RAMDISK_DATA_DIR="${RAMDISK_MOUNT_POINT}/pg_data_dir"

WITH_DEV_DATA=false

function parse_args {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --withDevData )
      WITH_DEV_DATA=true
      ;;
      * )
      echo "Invalid argument $1!"
      exit 1
      ;;
    esac
    shift
  done
}

parse_args "$@"

if $WITH_DEV_DATA; then
  if [ ! -f "${FLASHCROW_DEV_DATA}" ]; then
    # TODO: in this case, we should scp it from ETL directly!
    # However, that requires the SSH key to be provided.
    echo "cannot find ${FLASHCROW_DEV_DATA}; did you copy it from ETL?"
    exit 1
  fi
fi

# cleanup existing ramdisk (if any)
if [ -f "$RAMDISK_DEVICE_FILE" ]; then
  echo "Device file $RAMDISK_DEVICE_FILE found; shutting down existing instance..."
  "$(dirname "$0")"/shutdown.sh
fi

# create ramdisk using diskutil
echo "Creating ramdisk..."
sudo mkdir ${RAMDISK_MOUNT_POINT}
RAMDISK_DEVICE=$(sudo mount -t ramfs -o size=512m ramfs ${RAMDISK_MOUNT_POINT})
echo "$RAMDISK_DEVICE" | sudo tee ${RAMDISK_DEVICE_FILE}

# give 'vagrant' user/group ownership of the RAM-disk folder.
sudo chown -R vagrant:vagrant ${RAMDISK_MOUNT_POINT}
mkdir ${RAMDISK_DATA_DIR}
chmod -R g+rw ${RAMDISK_MOUNT_POINT}
touch "${RAMDISK_PGPASS}"
chmod 0600 "${RAMDISK_PGPASS}"

# generate admin password
echo "Generating PostgreSQL admin password..."
PG_ADMIN_PASSWORD=$(openssl rand -base64 32)
echo "${PG_ADMIN_PASSWORD}" > ${RAMDISK_PWFILE}
echo "localhost:5433:postgres:flashcrow_dba:${PG_ADMIN_PASSWORD}" >> ${RAMDISK_PGPASS}

# install PostgreSQL database files
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
echo "Starting PostgreSQL..."
pg_ctl \
  -D ${RAMDISK_DATA_DIR} \
  -l ${RAMDISK_MOUNT_POINT}/pg.${RAMDISK_NAME}.log \
  -o "-F -p 5433" \
  -w \
  start

# generate user password
echo "Generating PostgreSQL user password..."
PG_USER_PASSWORD=$(openssl rand -base64 32)
echo "localhost:5433:flashcrow:flashcrow:${PG_USER_PASSWORD}" >> ${RAMDISK_PGPASS}

# install MOVE database
echo "Setting up MOVE application database..."
psql -h localhost -p 5433 -U flashcrow_dba postgres -v pgPassword="'$PG_USER_PASSWORD'" < "${GIT_ROOT}/scripts/dev/provision-db-vagrant.sql"
psql -h localhost -p 5433 -U flashcrow flashcrow < "${GIT_ROOT}/scripts/db/db-update-install.sql"
"${GIT_ROOT}/scripts/db/db-update.sh" --psqlArgs "-h localhost -p 5433 -U flashcrow flashcrow"

if $WITH_DEV_DATA; then
  psql -h localhost -p 5433 -U flashcrow flashcrow < "${FLASHCROW_DEV_DATA}"
fi

echo "Done."
