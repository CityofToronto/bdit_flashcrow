#!/bin/bash

set -e
# Normally we would set -o nounset here, but that conflicts with /etc/bashrc
# and /etc/profile.d scripts.

export HOME=/home/ec2-user
# shellcheck disable=SC1091
source /home/ec2-user/.bash_profile

sudo cp /home/ec2-user/flashcrow/scripts/deployment/web/nginx/nginx.conf /etc/nginx/
sudo cp /home/ec2-user/flashcrow/scripts/deployment/web/nginx/default.d/*.conf /etc/nginx/default.d/
cp /home/ec2-user/flashcrow/scripts/deployment/web/forever.json /home/ec2-user/

cd /home/ec2-user/flashcrow
pip install -r requirements.txt
#copy config file:
cp /data/config/private.js /home/ec2-user/flashcrow/lib/config/private.js

#?? fix issues with running "npm run build" (using codebuild node_modules): Error: Cannot find module '../package.json'
rm -rf node_modules
npm install

# build static files into dist
npm run build

# copy to web root
sudo cp -r /home/ec2-user/flashcrow/dist /usr/share/nginx/html/flashcrow

# update database
# shellcheck disable=SC1091
. /home/ec2-user/psqlArgs.config
# shellcheck disable=SC2154
/home/ec2-user/flashcrow/scripts/db/db-update.sh --psqlArgs "$psqlArgs"

# start flashcrow
NODE_ENV=production forever start "/home/ec2-user/forever.json"

# need to restart nginx
sudo service nginx restart
