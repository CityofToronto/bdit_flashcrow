#!/bin/bash
#
# provision-web-user.sh
#
# Sets up web application-specific user-level packages and directories.
#
# This script should *not* contain any calls to sudo.  If you have commands
# that must be run as root, add them to provision-web-admin.sh.

set -e
set -o nounset

# create log directories
echo "creating log directories..."
mkdir -p "$HOME/log/flashcrow"
