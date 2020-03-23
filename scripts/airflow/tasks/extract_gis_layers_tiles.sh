#!/bin/bash

set -euo pipefail

rm -rf /data/tiles/hospitalsLevel2
mb-util --image_format=pbf --silent /data/tiles/hospitalsLevel2.mbtiles /data/tiles/hospitalsLevel2

rm -rf /data/tiles/schoolsLevel2
mb-util --image_format=pbf --silent /data/tiles/schoolsLevel2.mbtiles /data/tiles/schoolsLevel2
