#!/bin/bash

set -euo pipefail

# make sure code is up to date
if ! git ls-remote --exit-code code-commit; then
  echo "ERROR: code-commit remote is missing."
  echo "Ping MOVE developers on #prj_move in Slack to configure this git remote."
  exit 1
fi
git checkout master
git fetch
git pull

# run CI tests
npx npm-run-all ci:*

# attempt to build frontend
npm run build

git push code-commit master
