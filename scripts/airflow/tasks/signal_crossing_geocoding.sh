#!/bin/bash

set -eu
# shellcheck disable=SC2046
# shellcheck disable=SC2086
cd $(dirname $0)

env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 < signal_crossing_geocoding/signal_crossing_geocoding.sql
