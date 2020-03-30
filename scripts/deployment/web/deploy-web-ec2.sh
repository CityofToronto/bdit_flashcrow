#!/bin/bash
#
# deploy-web-ec2.sh
#
# Deploy the latest application version to the current machine.  This is
# intended to be run on EC2.

set -e
set -o nounset

GIT_ROOT=$(realpath "$(dirname "$0")"/../../..)
WEB_ROOT=/usr/share/nginx/html/flashcrow
FOREVER_ID=flashcrow-api

# stop application
if forever list | grep $FOREVER_ID; then
  forever stop $FOREVER_ID
fi

# update to latest code
cd "$GIT_ROOT"
git fetch
git merge origin/master

# update dependencies
# shellcheck disable=SC1090
. ~/.nvm/nvm.sh
nvm use
npm install -g forever
npm install
pip install -r requirements.txt

# build static files into dist
npm run frontend:build

# copy to web root
sudo rm -r $WEB_ROOT
sudo cp -r dist $WEB_ROOT

# update database
. "$HOME/psqlArgs.config"
# shellcheck disable=SC2154
"$GIT_ROOT/scripts/db/db-update.sh" --psqlArgs "$psqlArgs"

# start application again
NODE_ENV=production forever start "$GIT_ROOT/scripts/deployment/web/forever.json"
