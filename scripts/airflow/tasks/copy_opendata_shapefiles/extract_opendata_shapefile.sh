#!/bin/bash

set -euo pipefail

BASE_URL="https://ckan0.cf.opendata.inter.prod-toronto.ca/api/3"
DATASET_ID="{{ params.dataset_id }}"
NAME="{{ params.name }}"

SHAPEFILE_ZIP_PATH="/data/shapefile/${NAME}.zip"
SHAPEFILE_DIR="/data/shapefile/${NAME}"

mkdir -p /data/shapefile

DATASET_METADATA_URL="${BASE_URL}/action/package_show?id=${DATASET_ID}"
DATASET_URL=$(curl -s "${DATASET_METADATA_URL}" | jq -r ".result.resources[0].url")
curl "${DATASET_URL}" > "${SHAPEFILE_ZIP_PATH}"

rm -rf "${SHAPEFILE_DIR}"
unzip "${SHAPEFILE_ZIP_PATH}" -d "${SHAPEFILE_DIR}"
