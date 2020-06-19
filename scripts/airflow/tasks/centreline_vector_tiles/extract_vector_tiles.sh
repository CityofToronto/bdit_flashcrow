#!/bin/bash

set -euo pipefail

rm -rf /data/tiles/midblocks
mb-util --image_format=pbf --silent /data/tiles/midblocks.mbtiles /data/tiles/midblocks

rm -rf /data/tiles/intersections
mb-util --image_format=pbf --silent /data/tiles/intersections.mbtiles /data/tiles/intersections
