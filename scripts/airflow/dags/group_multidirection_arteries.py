"""
group_multidirection_arteries

Our FLOW dataset has a separate `COUNT_INFO_ID` for every day a count is performed at a location.
This DAG builds "multiday count groups", which group together counts of the same type at the same
location on consecutive days.

Note that we do not group *permanent* counts (i.e. "PERM STN" or "RESCU") for now, as we have no
reliable way to visualize that much data at once.
"""
# pylint: disable=pointless-statement
from datetime import datetime

from airflow_utils import create_dag, create_bash_task_nested

START_DATE = datetime(2020, 5, 6)
SCHEDULE_INTERVAL = '0 5 * * *'
DAG = create_dag(__file__, __doc__, START_DATE, SCHEDULE_INTERVAL)

A2_ARTERIES_MIDBLOCK_LINK_PAIRS = create_bash_task_nested(DAG, 'A2_arteries_midblock_link_pairs')
A2_ARTERIES_MIDBLOCK_SOLO = create_bash_task_nested(DAG, 'A2_arteries_midblock_solo')
A3_ARTERIES_GROUPS_PRE = create_bash_task_nested(DAG, 'A3_arteries_groups_pre')
A4_ARTERIES_GROUPS_RANKED = create_bash_task_nested(DAG, 'A4_arteries_groups_ranked')
A5_ARTERIES_GROUPS_POST = create_bash_task_nested(DAG, 'A5_arteries_groups_post')

A2_ARTERIES_MIDBLOCK_LINK_PAIRS >> A3_ARTERIES_GROUPS_PRE
A2_ARTERIES_MIDBLOCK_SOLO >> A3_ARTERIES_GROUPS_PRE
A3_ARTERIES_GROUPS_PRE >> A4_ARTERIES_GROUPS_RANKED
A4_ARTERIES_GROUPS_RANKED >> A5_ARTERIES_GROUPS_POST
