#!/bin/bash

set -euo pipefail

TARGET_ENV=
if [ "${CI_COMMIT_REF_NAME}" = "master" ]; then
  TARGET_ENV="flashcrow-dev0"
elif [ "${CI_COMMIT_REF_NAME}" = "deploy-qa" ]; then
  TARGET_ENV="flashcrow-qa0"
else
  echo "Invalid branch for deployment: ${CI_COMMIT_REF_NAME}"
  exit 1
fi

# notify prj_move on Slack
curl -H "Content-Type: application/json; charset=utf-8" -d "{\"text\": \"<!here> MOVE down for deployment: ${CI_COMMIT_REF_NAME} @ ${CI_COMMIT_SHORT_SHA} -> ${TARGET_ENV}\"}" "$SLACK_WEBHOOK_URL"

git push https://git-codecommit.ca-central-1.amazonaws.com/v1/repos/bdit_flashcrow "HEAD:refs/heads/${CI_COMMIT_REF_NAME}"
