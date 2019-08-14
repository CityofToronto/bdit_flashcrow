#!/bin/bash

set -euo pipefail

RAMDISK_NAME=ramdisk_move_test
RAMDISK_MOUNT_POINT=/mnt/${RAMDISK_NAME}
RAMDISK_DEVICE_FILE="${RAMDISK_MOUNT_POINT}/pg.$RAMDISK_NAME.device"
RAMDISK_DATA_DIR="${RAMDISK_MOUNT_POINT}/pg_data_dir"

if [ ! -f "$RAMDISK_DEVICE_FILE" ]; then
  echo "Device file $RAMDISK_DEVICE_FILE missing; did you run startup.sh?"
  exit 1
fi

# shutdown PostgreSQL database
if pg_ctl -D ${RAMDISK_DATA_DIR} status; then
  echo "Shutting down PostgreSQL..."
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
