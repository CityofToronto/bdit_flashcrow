#!/bin/bash

set -e
# Normally we would set -o nounset here, but that conflicts with /etc/bashrc
# and /etc/profile.d scripts.

# shellcheck disable=SC1091
source /home/ec2-user/.bash_profile
cd /home/ec2-user/flashcrow
curl http://localhost/
