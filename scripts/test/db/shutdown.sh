#!/bin/bash
#
# shutdown.sh
#
# This is called by `DAOTestUtils.shutdown()` to tear down the database and in-memory
# filesystem created by `startup.sh`.

set -euo pipefail

# Directory under `/mnt` that is used for our in-memory filesystem.
RAMDISK_NAME=ramdisk_move_test
RAMDISK_MOUNT_POINT=/mnt/${RAMDISK_NAME}

# Used to store the device identifier for easy unmounting.
RAMDISK_DEVICE_FILE="${RAMDISK_MOUNT_POINT}/.device"

# This directory stores database data.
RAMDISK_DATA_DIR="${RAMDISK_MOUNT_POINT}/pg_data_dir"

if [ ! -f "$RAMDISK_DEVICE_FILE" ]; then
  echo "Device file $RAMDISK_DEVICE_FILE missing; did you run startup.sh?"
  exit 1
fi

# shutdown PostgreSQL database
if pg_ctl -D ${RAMDISK_DATA_DIR} status; then
  echo "Shutting down PostgreSQL..."
  # -w waits for shutdown to complete
  pg_ctl \
    -D ${RAMDISK_DATA_DIR} \
    -w \
    stop
else
    echo "No PostgreSQL instance found..."
fi

# eject ramdisk using umount
echo "Ejecting ramdisk..."
sudo umount ${RAMDISK_MOUNT_POINT}
sudo rmdir ${RAMDISK_MOUNT_POINT}

echo "Done."
