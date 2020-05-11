"""
group_multiday_counts

Our FLOW dataset has a separate `COUNT_INFO_ID` for every day a count is performed at a location.
This DAG builds "multiday count groups", which group together counts of the same type at the same
location on consecutive days.

Note that we do not group *permanent* counts (i.e. "PERM STN" or "RESCU") for now, as we have no
reliable way to visualize that much data at once.
"""
# pylint: disable=pointless-statement
from datetime import datetime

from airflow_utils import create_dag, create_bash_task_nested

START_DATE = datetime(2020, 3, 1)
SCHEDULE_INTERVAL = '30 5 * * *'
DAG = create_dag(__file__, __doc__, START_DATE, SCHEDULE_INTERVAL)

A1_COUNTS_MULTIDAY_RUNS = create_bash_task_nested(DAG, 'A1_counts_multiday_runs')
A2_ARTERIES_COUNTS_GROUPS = create_bash_task_nested(DAG, 'A2_arteries_counts_groups')
A3_STUDIES = create_bash_task_nested(DAG, 'A3_studies')

A1_COUNTS_MULTIDAY_RUNS >> A2_ARTERIES_COUNTS_GROUPS
A2_ARTERIES_COUNTS_GROUPS >> A3_STUDIES
