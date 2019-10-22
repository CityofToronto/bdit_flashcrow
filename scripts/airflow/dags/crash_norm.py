"""
crash_norm

Pipeline for normalizing collision data
"""
# pylint: disable=pointless-statement
from datetime import datetime

from airflow_utils import create_dag, create_bash_task

START_DATE = datetime(2019, 7, 9)
SCHEDULE_INTERVAL = '10 6-22 * * 1-5'
DAG = create_dag(__file__, __doc__, START_DATE, SCHEDULE_INTERVAL)

CRASH_NORM = create_bash_task(DAG, 'crash_norm')
COPY_COLLISION_FACTORS = create_bash_task(DAG, 'copy_collision_factors')

CRASH_NORM >> COPY_COLLISION_FACTORS
