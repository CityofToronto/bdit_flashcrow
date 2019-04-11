#!/bin/bash
#
# ec2.sh
#
# Deploy the latest application version to the current machine.  This is
# intended to be run on EC2.

set -e
set -o nounset

GIT_ROOT=$(git rev-parse --show-toplevel)
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
npm run build

# copy to web root
sudo rm -r $WEB_ROOT
sudo cp -r dist $WEB_ROOT

# update database
"$GIT_ROOT/scripts/db/db-update.sh" --psqlArgs "-U flashcrow -h fr194ibxx9jxbj3.ccca5v4b7zsj.us-east-1.rds.amazonaws.com -p 5432 flashcrow"

# start application again
NODE_ENV=production forever start "$GIT_ROOT/scripts/deployment/forever.json"
