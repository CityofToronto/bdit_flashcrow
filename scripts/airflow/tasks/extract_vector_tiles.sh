#!/bin/bash

set -euo pipefail

rm -rf /data/tiles/centreline
mb-util --image_format=pbf --silent /data/tiles/centreline.mbtiles /data/tiles/centreline

rm -rf /data/tiles/intersections
mb-util --image_format=pbf --silent /data/tiles/intersections.mbtiles /data/tiles/intersections
