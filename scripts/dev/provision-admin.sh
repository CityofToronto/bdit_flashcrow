#!/bin/bash
#
# provision-admin.sh
#
# Installs amazon-linux-extras and yum packages during provisioning.  This
# script is intended to be run as root.
#
# This script should *not* contain any calls to sudo.

set -e
set -o nounset

# update existing packages
yum update -y

chown vagrant:vagrant -R /var/run/postgresql
