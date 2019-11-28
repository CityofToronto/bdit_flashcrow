#!/bin/bash
# shellcheck disable=SC1091

set -euo pipefail

exec > >(tee -ia /home/ec2-user/flashcrow/validate.log)
exec 2> >(tee -ia /home/ec2-user/flashcrow/validate.log >&2)

curl --silent --show-error --fail http://localhost
