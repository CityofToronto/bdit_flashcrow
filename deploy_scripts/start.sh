#!/bin/bash
export HOME=/home/ec2-user
source /home/ec2-user/.bash_profile

sudo cp /home/ec2-user/flashcrow/scripts/deployment/web/nginx/nginx.conf /etc/nginx/
sudo cp /home/ec2-user/flashcrow/scripts/deployment/web/nginx/default.d/*.conf /etc/nginx/default.d/
cp /home/ec2-user/flashcrow/scripts/deployment/web/forever.json /home/ec2-user/

cd /home/ec2-user/flashcrow
pip install -r requirements.txt
#NODE_ENV=production npm start > /dev/null 2> /dev/null < /dev/null &
#copy config file:
cp /home/ec2-user/flashcrow.config.js /home/ec2-user/flashcrow/lib/config.js

#?? fix issues with running "npm run build" (using codebuild node_modules): Error: Cannot find module '../package.json'
rm -rf node_modules
npm install

# build static files into dist
npm run build

# copy static files
sudo cp -r /home/ec2-user/flashcrow/dist /usr/share/nginx/html/flashcrow

# start flashcrow
NODE_ENV=production forever start "/home/ec2-user/forever.json"

# need to restart nginx
sudo service nginx restart
