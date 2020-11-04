#!/bin/bash

set -euo pipefail

sudo -u appsvc env NODE_ENV=production PATH=/var/app/nodejs/bin forever stopall
