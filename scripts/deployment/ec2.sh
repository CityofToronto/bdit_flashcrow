#!/bin/bash

set -e
set -o nounset

GIT_ROOT=$(git rev-parse --show-toplevel)
# update to latest code
cd $GIT_ROOT
git fetch
git merge origin/master

# update dependencies
. ~/.nvm/nvm.sh
nvm use
npm install -g forever
npm install
pip install -r requirements.txt

# update database
$GIT_ROOT/scripts/db/db-update-ec2.sh
