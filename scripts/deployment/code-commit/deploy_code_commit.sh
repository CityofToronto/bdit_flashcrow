#!/bin/bash

set -euo pipefail

# notify prj_move on Slack
curl -H "Content-Type: application/json; charset=utf-8" -d "{\"text\": \"<!here> MOVE down for deployment: ${CI_COMMIT_REF_NAME} @ ${CI_COMMIT_SHORT_SHA} -> flashcrow-dev0\"}" "$SLACK_WEBHOOK_URL"

git push https://git-codecommit.ca-central-1.amazonaws.com/v1/repos/bdit_flashcrow HEAD:master
