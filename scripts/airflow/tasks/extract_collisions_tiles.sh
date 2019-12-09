#!/bin/bash

set -euo pipefail

rm -rf /data/tiles/collisions
mb-util --image_format=pbf --silent /data/tiles/collisions.mbtiles /data/tiles/collisions
