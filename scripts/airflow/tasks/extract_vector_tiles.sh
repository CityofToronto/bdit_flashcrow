#!/bin/bash

set -eu

cd $(dirname $0)

rm -rf extract_vector_tiles/centreline
mb-util --image_format=pbf build_vector_tiles/centreline.mbtiles extract_vector_tiles/centreline
gzip -d -r -S .pbf extract_vector_tiles/centreline
find extract_vector_tiles/centreline -type f -exec mv '{}' '{}'.pbf \;

rm -rf extract_vector_tiles/intersections
mb-util --image_format=pbf build_vector_tiles/intersections.mbtiles extract_vector_tiles/intersections
gzip -d -r -S .pbf extract_vector_tiles/intersections
find extract_vector_tiles/intersections -type f -exec mv '{}' '{}'.pbf \;

rm -rf /data/tiles
mkdir -p /data/tiles
mv extract_vector_tiles/centreline /data/tiles
mv extract_vector_tiles/intersections /data/tiles
