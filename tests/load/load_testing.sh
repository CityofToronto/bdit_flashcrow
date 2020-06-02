#!/bin/bash

set -euo pipefail

cd "$(dirname "$0")"

mkdir -p results
for path_list in paths/*.txt; do
  PATH_LIST_BASE="$(basename "${path_list%%.txt}")"
  MAX_REQ=2000
  if echo "$PATH_LIST_BASE" | grep getReport; then
    # much lower value, to allow recovery between load tests
    MAX_REQ=20
  fi

  echo "[${PATH_LIST_BASE}] warm-up..."
  env WRK2_PATH_LIST="${path_list}" wrk -t2 -c10 -d5s -R100 -s path_list.lua --latency https://move.intra.dev-toronto.ca

  echo "[${PATH_LIST_BASE}] computing maximum response rate..."
  env WRK2_PATH_LIST="${path_list}" wrk -t2 -c100 -d20s -R"${MAX_REQ}" -s path_list.lua --latency https://move.intra.dev-toronto.ca > "results/${PATH_LIST_BASE}_max.txt"
  tail -24 "results/${PATH_LIST_BASE}_max.txt" > "results/${PATH_LIST_BASE}_max.json"
  MAX_REQ=$(jq '.requests_per_sec' "results/${PATH_LIST_BASE}_max.json" | cut -d. -f1)
  echo "[${PATH_LIST_BASE}] max = ${MAX_REQ}"

  echo "[${PATH_LIST_BASE}] computing practical response rate..."
  if (("${MAX_REQ}" <= 20)); then
    for req in $(seq 1 "${MAX_REQ}"); do
      env WRK2_PATH_LIST="${path_list}" wrk -t2 -c100 -d20s -R"${req}" -s path_list.lua --latency https://move.intra.dev-toronto.ca > "results/${PATH_LIST_BASE}_R${req}.txt"
      tail -24 "results/${PATH_LIST_BASE}_R${req}.txt" > "results/${PATH_LIST_BASE}_R${req}.json"
      REQ_LATENCY=$(jq ".latency[3][1]" "results/${PATH_LIST_BASE}_R${req}.json")
      REQ_LATENCY_MS=$(echo "${REQ_LATENCY} / 1000" | bc)
      echo "[${PATH_LIST_BASE}]   ${req}: ${req} req/s (p95 = ${REQ_LATENCY_MS} ms)"
    done
  else
    for pct in $(seq 20 5 80); do
      PCT_REQ=$(echo "${MAX_REQ} * ${pct} / 100" | bc -l)
      env WRK2_PATH_LIST="${path_list}" wrk -t2 -c100 -d20s -R"${PCT_REQ}" -s path_list.lua --latency https://move.intra.dev-toronto.ca > "results/${PATH_LIST_BASE}_pct${pct}.txt"
      tail -24 "results/${PATH_LIST_BASE}_pct${pct}.txt" > "results/${PATH_LIST_BASE}_pct${pct}.json"
      PCT_LATENCY=$(jq ".latency[3][1]" "results/${PATH_LIST_BASE}_pct${pct}.json")
      PCT_LATENCY_MS=$(echo "${PCT_LATENCY} / 1000" | bc)
      echo "[${PATH_LIST_BASE}]   ${pct}%: ${PCT_REQ} req/s (p95 = ${PCT_LATENCY_MS} ms)"
    done
  fi
  echo "[${PATH_LIST_BASE}] finished."
done
