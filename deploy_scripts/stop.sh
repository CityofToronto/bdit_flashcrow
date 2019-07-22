#!/bin/bash

set -e
# Normally we would set -o nounset here, but that conflicts with /etc/bashrc
# and /etc/profile.d scripts.

export HOME=/home/ec2-user
# shellcheck disable=SC1091
source /home/ec2-user/.bash_profile
cd /home/ec2-user

#NODE_ENV=production forever stop 0 || echo "forever is not running"
if NODE_ENV=production forever list | grep 'No forever' &> /dev/null; then
    echo "forever is not running."
else
    NODE_ENV=production forever stop 0
    echo "forever stopped."
fi
echo "end."
