#!/bin/bash

set -euo pipefail

NAME="{{ params.name }}"

SHAPEFILE_DIR="/data/shapefile/${NAME}"
SHAPEFILE_PATH=$(ls "${SHAPEFILE_DIR}"/*.shp)
SQL_PATH="/data/gis_layers/${NAME}.sql"

mkdir -p /data/gis_layers

rm -f "${SQL_PATH}"

cat <<EOF >> "${SQL_PATH}"
CREATE SCHEMA IF NOT EXISTS "gis";
CREATE SCHEMA IF NOT EXISTS "gis_new";
EOF

# create source table
shp2pgsql -p -s 4326 "${SHAPEFILE_PATH}" "gis_new.${NAME}" 2>/dev/null \
  | sed "s/CREATE TABLE/CREATE TABLE IF NOT EXISTS/;s/serial/serial PRIMARY KEY/;s/);/,/;s/.*AddGeometryColumn.*'4326','\(.*\)'.*/\"geom\" GEOMETRY(\1, 4326) NOT NULL);/" \
  | grep -v "ALTER TABLE" >> "${SQL_PATH}"

cat <<EOF >> "${SQL_PATH}"
TRUNCATE TABLE "gis_new"."${NAME}";
EOF

shp2pgsql -a -D -s 4326 "${SHAPEFILE_PATH}" "gis_new.${NAME}" 2>/dev/null >> "${SQL_PATH}"

# create materialized view and indexes
cat <<EOF >> "${SQL_PATH}"
CREATE MATERIALIZED VIEW IF NOT EXISTS "gis"."${NAME}" AS
  SELECT * FROM "gis_new"."${NAME}";

CREATE UNIQUE INDEX IF NOT EXISTS "${NAME}_gid"
ON "gis"."${NAME}" (gid);

CREATE INDEX IF NOT EXISTS "${NAME}_geom"
ON "gis"."${NAME}"
USING GIST (geom);

CREATE INDEX IF NOT EXISTS "${NAME}_srid3857_geom"
ON "gis"."${NAME}"
USING GIST (ST_Transform(geom, 3857));

CREATE INDEX IF NOT EXISTS "${NAME}_srid2952_geom"
ON "gis"."${NAME}"
USING GIST (ST_Transform(geom, 2952));

REFRESH MATERIALIZED VIEW CONCURRENTLY "gis"."${NAME}";
EOF

# shellcheck disable=SC2046
env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 < "${SQL_PATH}"
