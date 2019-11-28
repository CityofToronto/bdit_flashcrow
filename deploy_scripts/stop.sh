#!/bin/bash

set -euo pipefail

nvm use lts/*
if NODE_ENV=production forever list | grep 'No forever'; then
    echo "forever is not running."
else
    NODE_ENV=production forever stopall
    echo "forever stopped."
fi
echo "end."
