"""
dev_data

Generates a test dataset for development by sampling collisions and counts.  This
allows us to conduct local tests against actual data.
"""
# pylint: disable=pointless-statement
from datetime import datetime

from airflow_utils import create_dag, create_bash_task

START_DATE = datetime(2019, 5, 8)
SCHEDULE_INTERVAL = '30 5 * * 6'
DAG = create_dag(__file__, __doc__, START_DATE, SCHEDULE_INTERVAL)

SAMPLE_DEV_DATA = create_bash_task(DAG, 'sample_dev_data')
DUMP_DEV_DATA = create_bash_task(DAG, 'dump_dev_data')

SAMPLE_DEV_DATA >> DUMP_DEV_DATA
