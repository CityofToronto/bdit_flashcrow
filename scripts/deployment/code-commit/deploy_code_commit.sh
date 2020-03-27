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
npm run frontend:build

# attempt to build docs
npm run docs:build

# notify prj_move on Slack
CURRENT_REVISION=$(git rev-parse HEAD)
curl -H "Content-Type: application/json; charset=utf-8" -d "{\"text\": \"<!here> MOVE down for deployment: ${CURRENT_REVISION} -> flashcrow-dev0\"}" "$SLACK_WEBHOOK_URL"

git push code-commit master
