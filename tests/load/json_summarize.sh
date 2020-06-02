#!/bin/bash

set -euo pipefail

cd "$(dirname "$0")"

find results -type f -name "*.json" | while read json_stats; do
  REQUESTS_PER_SEC=$(jq ".requests_per_sec" "$json_stats")
  LATENCY_P95=$(jq ".latency[3][1]" "$json_stats")
  LATENCY_P95_MS=$(echo "${LATENCY_P95} / 1000" | bc)
  ERR_STATUS=$(jq ".errors.status" "$json_stats")
  echo "${json_stats},${REQUESTS_PER_SEC},${LATENCY_P95_MS},${ERR_STATUS}"
done | tr ',' '\t'
