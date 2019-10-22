"""
crash_geocoding

Match collisions to a centreline street segment or intersection.
"""
# pylint: disable=pointless-statement
from datetime import datetime

from airflow_utils import create_dag, create_bash_task

START_DATE = datetime(2019, 7, 17)
SCHEDULE_INTERVAL = '0 0 * * *'
DAG = create_dag(__file__, __doc__, START_DATE, SCHEDULE_INTERVAL)

CRASH_GEOCODING = create_bash_task(DAG, 'crash_geocoding')
