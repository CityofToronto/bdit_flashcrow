#!/bin/bash

set -euo pipefail

rm -rf /data/tiles/collisionsLevel3
mb-util --image_format=pbf --silent /data/tiles/collisionsLevel3.mbtiles /data/tiles/collisionsLevel3

rm -rf /data/tiles/collisionsLevel2
mb-util --image_format=pbf --silent /data/tiles/collisionsLevel2.mbtiles /data/tiles/collisionsLevel2
