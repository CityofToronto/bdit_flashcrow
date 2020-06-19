"""
location_search_index

Build any necessary views and indexes to support MOVE location search, which
supplements geocoding and suggestion APIs provided by GCC.
"""
# pylint: disable=pointless-statement
from datetime import datetime

from airflow_utils import create_dag, create_bash_task_nested

START_DATE = datetime(2020, 4, 5)
SCHEDULE_INTERVAL = '30 6 * * 6'
DAG = create_dag(__file__, __doc__, START_DATE, SCHEDULE_INTERVAL)

TRANSFORM_INTERSECTIONS_INDEX = create_bash_task_nested(DAG, 'transform_intersections_index')
TRANSFORM_TRAFFIC_SIGNAL = create_bash_task_nested(DAG, 'transform_traffic_signal')
