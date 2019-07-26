#!/bin/bash

set -euo pipefail

if ! git ls-remote --exit-code code-commit; then
  echo "ERROR: code-commit remote is missing."
  echo "Ping MOVE developers on #prj_move in Slack to configure this git remote."
  exit 1
fi
git checkout master
npx npm-run-all ci:*
git push code-commit master
