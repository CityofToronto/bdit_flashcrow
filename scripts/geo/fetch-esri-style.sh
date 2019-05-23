#!/bin/bash
#
# fetch-esri-style.sh []
#
# Given the style ID of a map tile style from ESRI, fetch the root and metadata files and store them in
# @/lib/geo for access by GeoStyle.

set -e
set -o nounset

STYLE_ID=

function parse_args {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --styleId )
      STYLE_ID="$2"
      shift
      ;;
      * )
      echo "Invalid argument $1!"
      exit 1
      ;;
    esac
    shift
  done

  if [[ -z "$STYLE_ID" ]]; then
    echo "ESRI style ID required!"
    exit 1
  fi
}

parse_args "$@"

# paths to important folders / files
DIR_ROOT=$(git rev-parse --show-toplevel)
DIR_LIB_GEO="$DIR_ROOT/src/lib/geo"
STYLE_FILE="$DIR_LIB_GEO/root.json"
METADATA_FILE="$DIR_LIB_GEO/metadata.json"
STYLE_URL="http://www.arcgis.com/sharing/rest/content/items/$STYLE_ID/resources/styles/root.json"

# fetch style root
curl -s "$STYLE_URL" > "$STYLE_FILE"

# fetch style metadata
METADATA_URL=$(jq -r ".sources.esri.url" "$STYLE_FILE")
curl -s "$METADATA_URL" > "$METADATA_FILE"
