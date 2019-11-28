#!/bin/bash

set -euo pipefail

exec > >(tee -ia /home/ec2-user/log/flashcrow/stop.log)
exec 2> >(tee -ia /home/ec2-user/log/flashcrow/stop.log >&2)

if NODE_ENV=production forever list | grep 'No forever'; then
    echo "forever is not running."
else
    NODE_ENV=production forever stopall
    echo "forever stopped."
fi
echo "end."
