#!/bin/bash
#
# provision-web-ec2.sh
#
# Provision the current machine as part of the MOVE Web Stack.  This is
# intended to be run on EC2.

set -e
set -o nounset

cd "$(dirname "$0")"
sudo ../provision-admin.sh etl
sudo ./provision-etl-admin.sh
../provision-user.sh
./provision-etl-user.sh
