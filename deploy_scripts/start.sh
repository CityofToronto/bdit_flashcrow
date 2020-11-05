#!/bin/bash
# shellcheck disable=SC1090,SC1091

set -euo pipefail

# copy repo to /var/app/flashcrow
sudo rm -rf /var/app/flashcrow
sudo cp -R ~ec2-user/flashcrow /var/app

# copy private / forever configs to /var/app/flashcrow
sudo chown -R ec2-user:ec2-user /var/app/flashcrow
cp -r /home/ec2-user/flashcrow.config.js /var/app/flashcrow/lib/config/private.js

# copy nginx configs to /etc/nginx
sudo cp /home/ec2-user/flashcrow/scripts/deployment/web/nginx/nginx.conf /etc/nginx/
sudo cp /home/ec2-user/flashcrow/scripts/deployment/web/nginx/default.d/*.conf /etc/nginx/default.d/

# make log directory
sudo mkdir -p /var/app/log

# install node dependencies
cd /var/app/flashcrow
export PATH="/var/app/nodejs/bin:$PATH"
npm ci
npm install -g forever

# build static files into dist
npm run frontend:build
npm run docs:build

# copy to web root
sudo rm -rf /usr/share/nginx/html/flashcrow
sudo cp -r /home/ec2-user/flashcrow/dist /usr/share/nginx/html/flashcrow

# update database
. /home/ec2-user/psqlArgs.config
# shellcheck disable=SC2154
/var/app/flashcrow/scripts/db/db-update.sh --psqlArgs "$psqlArgs"

# start flashcrow
cd /var/app/flashcrow
# shellcheck disable=SC2046
sudo -u appsvc env $(xargs < /var/app/config/cot-env.config) PATH="$PATH" NODE_ENV=production NODE_EXTRA_CA_CERTS=/var/app/ssl/extra-ca-certs.cer forever start /var/app/flashcrow/scripts/deployment/web/forever.json

# need to restart nginx
sudo service nginx restart
