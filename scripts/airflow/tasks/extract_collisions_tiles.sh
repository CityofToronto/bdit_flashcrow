#!/bin/bash

set -euo pipefail

rm -rf /data/tiles/collisionsLevel3:1
mb-util --image_format=pbf --silent /data/tiles/collisionsLevel3:1.mbtiles /data/tiles/collisionsLevel3:1
rm -rf /data/tiles/collisionsLevel3:3
mb-util --image_format=pbf --silent /data/tiles/collisionsLevel3:3.mbtiles /data/tiles/collisionsLevel3:3
rm -rf /data/tiles/collisionsLevel3:5
mb-util --image_format=pbf --silent /data/tiles/collisionsLevel3:5.mbtiles /data/tiles/collisionsLevel3:5
rm -rf /data/tiles/collisionsLevel3:10
mb-util --image_format=pbf --silent /data/tiles/collisionsLevel3:10.mbtiles /data/tiles/collisionsLevel3:10

rm -rf /data/tiles/collisionsLevel2:1
mb-util --image_format=pbf --silent /data/tiles/collisionsLevel2:1.mbtiles /data/tiles/collisionsLevel2:1
rm -rf /data/tiles/collisionsLevel2:3
mb-util --image_format=pbf --silent /data/tiles/collisionsLevel2:3.mbtiles /data/tiles/collisionsLevel2:3
rm -rf /data/tiles/collisionsLevel2:5
mb-util --image_format=pbf --silent /data/tiles/collisionsLevel2:5.mbtiles /data/tiles/collisionsLevel2:5
rm -rf /data/tiles/collisionsLevel2:10
mb-util --image_format=pbf --silent /data/tiles/collisionsLevel2:10.mbtiles /data/tiles/collisionsLevel2:10
