#!/bin/bash
# shellcheck disable=SC1090,SC1091

set -euo pipefail

set +u
source ~/.bash_profile
set -u

# copy private config to repo
cp ~/flashcrow.config.js ~/flashcrow/lib/config/private.js

# copy nginx / forever configs from repo
sudo cp ~/flashcrow/scripts/deployment/web/nginx/nginx.conf /etc/nginx/
sudo cp ~/flashcrow/scripts/deployment/web/nginx/default.d/*.conf /etc/nginx/default.d/
cp ~/flashcrow/scripts/deployment/web/forever.json ~/forever.json

# make log directory
mkdir -p ~/log/flashcrow

# install node and Python dependencies
cd ~/flashcrow
nvm use
npm install
pip install -r requirements.txt

# build static files into dist
npm run build

# copy to web root
sudo rm -rf /usr/share/nginx/html/flashcrow
sudo cp -r ~/flashcrow/dist /usr/share/nginx/html/flashcrow

# update database
. ~/psqlArgs.config
# shellcheck disable=SC2154
~/flashcrow/scripts/db/db-update.sh --psqlArgs "$psqlArgs"

# start flashcrow
# shellcheck disable=SC2046
env $(xargs < ~/cot-env.config) NODE_ENV=production forever start ~/forever.json

# need to restart nginx
sudo service nginx restart
