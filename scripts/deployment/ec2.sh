#!/bin/bash

set -e
set -o nounset

GIT_ROOT=$(git rev-parse --show-toplevel)

cd $GIT_ROOT
nvm use
npm install
pip install -r requirements.txt
git fetch
git merge origin/master
$GIT_ROOT/scripts/db/db-update.sh
