#!/bin/bash

set -euo pipefail

mkdir -p results
for path_list in paths/*.txt; do
  PATH_LIST_BASE="$(basename "${path_list%%.txt}")"

  echo "[${PATH_LIST_BASE}] warm-up..."
  env WRK2_PATH_LIST="${path_list}" wrk -t2 -c10 -d5s -R100 -s path_list.lua --latency https://move.intra.dev-toronto.ca

  echo "[${PATH_LIST_BASE}] computing maximum response rate..."
  env WRK2_PATH_LIST="${path_list}" wrk -t2 -c100 -d30s -R10000 -s path_list.lua --latency https://move.intra.dev-toronto.ca > "results/${PATH_LIST_BASE}_max.txt"
  tail -24 "results/${PATH_LIST_BASE}_max.txt" > "results/${PATH_LIST_BASE}_max.json"
  MAX_REQ=$(jq '.requests_per_sec' "results/${PATH_LIST_BASE}_max.json" | cut -d. -f1)
  echo "[${PATH_LIST_BASE}] max = ${MAX_REQ}"

  echo "[${PATH_LIST_BASE}] computing practical response rate..."
  for pct in $(seq 20 5 80); do
    PCT_REQ=$(echo "${MAX_REQ} * ${pct} / 100" | bc)
    env WRK2_PATH_LIST="${path_list}" wrk -t2 -c100 -d30s -R"${PCT_REQ}" -s path_list.lua --latency https://move.intra.dev-toronto.ca > "results/${PATH_LIST_BASE}_R${PCT_REQ}.txt"
    tail -24 "results/${PATH_LIST_BASE}_R${PCT_REQ}.txt" > "results/${PATH_LIST_BASE}_R${PCT_REQ}.json"
    PCT_LATENCY=$(jq ".latency[3][1]" "results/${PATH_LIST_BASE}_R${PCT_REQ}.json")
    PCT_LATENCY_MS=$(echo "${PCT_LATENCY} / 1000" | bc)
    echo "[${PATH_LIST_BASE}]   ${pct}%: ${PCT_REQ} req/s (p95 ${PCT_LATENCY_MS} ms)"
  done
  echo "[${PATH_LIST_BASE}] finished."
done
