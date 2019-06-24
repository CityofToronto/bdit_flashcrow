#!/bin/bash
export HOME=/home/ec2-user
source /home/ec2-user/.bash_profile
cd /home/ec2-user

#NODE_ENV=production forever stop 0 || echo "forever is not running"
NODE_ENV=production forever list | grep 'No forever' &> /dev/null
if [ $? == 0 ]; then
    echo "forever is not running."
else
    NODE_ENV=production forever stop 0
    echo "forever stopped."
fi
echo "end."


#remove before install?
#sudo rm -rf /home/ec2-user/flashcrow