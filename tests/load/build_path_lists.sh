#!/bin/bash

set -euo pipefail

cd "$(dirname "$0")"

mkdir -p features
{
  # shellcheck disable=SC2046
  env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -c "COPY (SELECT 1, geo_id FROM counts.centreline TABLESAMPLE BERNOULLI (10)) TO stdout (FORMAT text, ENCODING 'UTF-8')"
  # shellcheck disable=SC2046
  env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -c "COPY (SELECT 2, int_id FROM counts.centreline_intersection TABLESAMPLE BERNOULLI (10)) TO stdout (FORMAT text, ENCODING 'UTF-8')"
} > features/centreline.txt
{
  # shellcheck disable=SC2046
  env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -c "COPY (SELECT \"CATEGORY_ID\", \"COUNT_INFO_ID\" FROM \"TRAFFIC\".\"COUNTINFO\" TABLESAMPLE BERNOULLI (1)) TO stdout (FORMAT text, ENCODING 'UTF-8')"
  # shellcheck disable=SC2046
  env $(xargs < "/home/ec2-user/cot-env.config") psql -v ON_ERROR_STOP=1 -c "COPY (SELECT \"CATEGORY_ID\", \"COUNT_INFO_ID\" FROM \"TRAFFIC\".\"COUNTINFOMICS\" TABLESAMPLE BERNOULLI (1)) TO stdout (FORMAT text, ENCODING 'UTF-8')"
} > features/counts.txt

mkdir -p paths
sed -r 's/^(.*)\t(.*)$/\/api\/collisions\/byCentreline\/summary?centrelineId=\2\&centrelineType=\1/' features/centreline.txt > paths/getCollisionsByCentrelineSummary.txt
sed -r 's/^(.*)\t(.*)$/\/api\/collisions\/byCentreline\/total?centrelineId=\2\&centrelineType=\1/' features/centreline.txt > paths/getCollisionsByCentrelineTotal.txt
sed -r 's/^(.*)\t(.*)$/\/api\/counts\/byCentreline\/summary?centrelineId=\2\&centrelineType=\1/' features/centreline.txt > paths/getCountsByCentrelineSummary.txt
sed -r 's/^(.*)\t(.*)$/\/api\/counts\/byCentreline\/total?centrelineId=\2\&centrelineType=\1/' features/centreline.txt > paths/getCountsByCentrelineTotal.txt
sed -r 's/^(.*)\t(.*)$/\/api\/location\/centreline?centrelineId=\2\&centrelineType=\1/' features/centreline.txt > paths/getLocationByFeature.txt
sed -r 's/^(.*)\t(.*)$/\/api\/poi\/byCentreline\/summary?centrelineId=\2\&centrelineType=\1/' features/centreline.txt > paths/getPoiByCentrelineSummary.txt
sed -r 's/^(.*)\t(.*)$/\/reporter\/reports?type=COLLISION_DIRECTORY\&id=\1%2F\2\&format=PDF/' features/centreline.txt > paths/getReport_COLLISION_DIRECTORY.txt
sed -r 's/^(.*)\t(.*)$/\/reporter\/reports?type=COLLISION_DIRECTORY\&id=\1%2F\2\&format=WEB/' features/centreline.txt > paths/getReportWeb_COLLISION_DIRECTORY.txt
sed -r 's/^(.*)\t(.*)$/\/reporter\/reports?type=COLLISION_TABULATION\&id=\1%2F\2\&format=PDF/' features/centreline.txt > paths/getReport_COLLISION_TABULATION.txt
sed -r 's/^(.*)\t(.*)$/\/reporter\/reports?type=COLLISION_TABULATION\&id=\1%2F\2\&format=WEB/' features/centreline.txt > paths/getReportWeb_COLLISION_TABULATION.txt
grep -E "^[12467]" features/counts.txt | sed -r 's/^(.*)\t(.*)$/\/reporter\/reports?type=COUNT_SUMMARY_24H\&id=\1%2F\2\&format=PDF/' > paths/getReport_COUNT_SUMMARY_24H.txt
grep -E "^[12467]" features/counts.txt | sed -r 's/^(.*)\t(.*)$/\/reporter\/reports?type=COUNT_SUMMARY_24H\&id=\1%2F\2\&format=WEB/' > paths/getReportWeb_COUNT_SUMMARY_24H.txt
grep -E "^[12467]" features/counts.txt | sed -r 's/^(.*)\t(.*)$/\/reporter\/reports?type=COUNT_SUMMARY_24H_DETAILED\&id=\1%2F\2\&format=PDF/' > paths/getReport_COUNT_SUMMARY_24H_DETAILED.txt
grep -E "^[12467]" features/counts.txt | sed -r 's/^(.*)\t(.*)$/\/reporter\/reports?type=COUNT_SUMMARY_24H_DETAILED\&id=\1%2F\2\&format=WEB/' > paths/getReportWeb_COUNT_SUMMARY_24H_DETAILED.txt
grep -E "^[12467]" features/counts.txt | sed -r 's/^(.*)\t(.*)$/\/reporter\/reports?type=COUNT_SUMMARY_24H_GRAPHICAL\&id=\1%2F\2\&format=PDF/' > paths/getReport_COUNT_SUMMARY_24H_GRAPHICAL.txt
grep -E "^[12467]" features/counts.txt | sed -r 's/^(.*)\t(.*)$/\/reporter\/reports?type=COUNT_SUMMARY_24H_GRAPHICAL\&id=\1%2F\2\&format=WEB/' > paths/getReportWeb_COUNT_SUMMARY_24H_GRAPHICAL.txt
grep -E "^5" features/counts.txt | sed -r 's/^(.*)\t(.*)$/\/reporter\/reports?type=COUNT_SUMMARY_TURNING_MOVEMENT\&id=\1%2F\2\&format=PDF/' > paths/getReport_COUNT_SUMMARY_TURNING_MOVEMENT.txt
grep -E "^5" features/counts.txt | sed -r 's/^(.*)\t(.*)$/\/reporter\/reports?type=COUNT_SUMMARY_TURNING_MOVEMENT\&id=\1%2F\2\&format=WEB/' > paths/getReportWeb_COUNT_SUMMARY_TURNING_MOVEMENT.txt
grep -E "^5" features/counts.txt | sed -r 's/^(.*)\t(.*)$/\/reporter\/reports?type=COUNT_SUMMARY_TURNING_MOVEMENT_DETAILED\&id=\1%2F\2\&format=PDF/' > paths/getReport_COUNT_SUMMARY_TURNING_MOVEMENT_DETAILED.txt
grep -E "^5" features/counts.txt | sed -r 's/^(.*)\t(.*)$/\/reporter\/reports?type=COUNT_SUMMARY_TURNING_MOVEMENT_DETAILED\&id=\1%2F\2\&format=WEB/' > paths/getReportWeb_COUNT_SUMMARY_TURNING_MOVEMENT_DETAILED.txt
grep -E "^5" features/counts.txt | sed -r 's/^(.*)\t(.*)$/\/reporter\/reports?type=INTERSECTION_SUMMARY\&id=\1%2F\2\&format=PDF/' > paths/getReport_INTERSECTION_SUMMARY.txt
grep -E "^5" features/counts.txt | sed -r 's/^(.*)\t(.*)$/\/reporter\/reports?type=INTERSECTION_SUMMARY\&id=\1%2F\2\&format=WEB/' > paths/getReportWeb_INTERSECTION_SUMMARY.txt
grep -E "^4" features/counts.txt | sed -r 's/^(.*)\t(.*)$/\/reporter\/reports?type=SPEED_PERCENTILE\&id=\1%2F\2\&format=PDF/' > paths/getReport_SPEED_PERCENTILE.txt
grep -E "^4" features/counts.txt | sed -r 's/^(.*)\t(.*)$/\/reporter\/reports?type=SPEED_PERCENTILE\&id=\1%2F\2\&format=WEB/' > paths/getReportWeb_SPEED_PERCENTILE.txt
grep -E "^5" features/counts.txt | sed -r 's/^(.*)\t(.*)$/\/reporter\/reports?type=WARRANT_TRAFFIC_SIGNAL_CONTROL\&id=\1%2F\2\&format=PDF/' > paths/getReport_WARRANT_TRAFFIC_SIGNAL_CONTROL.txt
grep -E "^5" features/counts.txt | sed -r 's/^(.*)\t(.*)$/\/reporter\/reports?type=WARRANT_TRAFFIC_SIGNAL_CONTROL\&id=\1%2F\2\&format=WEB/' > paths/getReportWeb_WARRANT_TRAFFIC_SIGNAL_CONTROL.txt
