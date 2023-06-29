#!/bin/bash
# shellcheck disable=SC1090,SC1091

set -euo pipefail

# copy repo to /var/app/flashcrow
sudo rm -rf /var/app/flashcrow
sudo cp -R ~ec2-user/flashcrow /var/app

# copy private / forever configs to /var/app/flashcrow
sudo chown -R ec2-user:ec2-user /var/app/flashcrow
cp -r /home/ec2-user/flashcrow.config.js /var/app/flashcrow/lib/config/private.js

# make move-storage directory
sudo mkdir -p /data/move-storage
sudo chown -R appsvc:appsvc /data/move-storage

# symlink web logs to data mount
sudo mkdir -p /data/log/web
sudo chown -R appsvc:appsvc /data/log/web
sudo ln -s /data/log/web /var/app/flashcrow/log

# install node dependencies
cd /var/app/flashcrow
export PATH="/var/app/nodejs/bin:$PATH"
npm ci

# build static files into dist
npm run frontend:build

# copy to web root
sudo rm -rf /usr/share/nginx/html/flashcrow
sudo cp -r /var/app/flashcrow/dist /usr/share/nginx/html/flashcrow

# update database
. /home/ec2-user/psqlArgs.config
# shellcheck disable=SC2154
/var/app/flashcrow/scripts/db/db-update.sh --psqlArgs "$psqlArgs"

# start flashcrow
cd /var/app/flashcrow
# shellcheck disable=SC2046
sudo -u appsvc env $(xargs < /var/app/config/cot-env.config) PATH="$PATH" NODE_ENV=production NODE_EXTRA_CA_CERTS=/var/app/ssl/extra-ca-certs.cer forever start /var/app/flashcrow/scripts/deployment/web/forever.json

# restart nginx, in case old file descriptors are open
sudo service nginx restart
