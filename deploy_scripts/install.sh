#!/bin/bash

set -e
# Normally we would set -o nounset here, but that conflicts with /etc/bashrc
# and /etc/profile.d scripts.

# shellcheck disable=SC1091
source /home/ec2-user/.bash_profile
cd /home/ec2-user
if ! node --version; then
   curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash
   # shellcheck disable=SC1090
   . ~/.nvm/nvm.sh
   nvm install lts/*
fi
