#!/bin/bash

set -euo pipefail

rm -rf /data/tiles/collisions-heatmap
mb-util --image_format=pbf --silent /data/tiles/collisions-heatmap.mbtiles /data/tiles/collisions-heatmap

rm -rf /data/tiles/collisions
mb-util --image_format=pbf --silent /data/tiles/collisions.mbtiles /data/tiles/collisions
