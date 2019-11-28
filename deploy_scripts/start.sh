#!/bin/bash
# shellcheck disable=SC1090,SC1091

set -euo pipefail

set +u
source /home/ec2-user/.bash_profile
set -u

# copy private config to repo
cp /home/ec2-user/flashcrow.config.js /home/ec2-user/flashcrow/lib/config/private.js

# copy nginx / forever configs from repo
sudo cp /home/ec2-user/flashcrow/scripts/deployment/web/nginx/nginx.conf /etc/nginx/
sudo cp /home/ec2-user/flashcrow/scripts/deployment/web/nginx/default.d/*.conf /etc/nginx/default.d/
cp /home/ec2-user/flashcrow/scripts/deployment/web/forever.json /home/ec2-user/forever.json

# make log directory
mkdir -p /home/ec2-user/log/flashcrow

# install node and Python dependencies
cd /home/ec2-user/flashcrow
#?? fix issues with running "npm run build" (using codebuild node_modules): Error: Cannot find module '../package.json'
rm -rf node_modules
nvm use lts/*
npm install
pip install -r requirements.txt

# build static files into dist
npm run build

# copy to web root
sudo rm -rf /usr/share/nginx/html/flashcrow
sudo cp -r /home/ec2-user/flashcrow/dist /usr/share/nginx/html/flashcrow

# update database
. /home/ec2-user/psqlArgs.config
# shellcheck disable=SC2154
/home/ec2-user/flashcrow/scripts/db/db-update.sh --psqlArgs "$psqlArgs"

# start flashcrow
# shellcheck disable=SC2046
env $(xargs < /home/ec2-user/cot-env.config) NODE_ENV=production forever start /home/ec2-user/forever.json

# need to restart nginx
sudo service nginx restart
