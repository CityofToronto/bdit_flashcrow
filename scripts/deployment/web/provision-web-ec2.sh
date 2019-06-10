#!/bin/bash
#
# provision-web-ec2.sh
#
# Provision the current machine as part of the Flashcrow Web Stack.  This is
# intended to be run on EC2.

set -e
set -o nounset

cd "$(dirname "$0")"
sudo ../provision-admin.sh web
../provision-user.sh
./provision-web-user.sh
