#!/bin/bash

set -euo pipefail

rm -rf /data/tiles/schools
mb-util --image_format=pbf --silent /data/tiles/schools.mbtiles /data/tiles/schools
