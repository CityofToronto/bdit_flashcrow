"""
flow_geocoding

Use arterycode matching information as built by Aakash (Big Data) to link
counts with the Toronto centreline.
"""
# pylint: disable=pointless-statement
from datetime import datetime

from airflow_utils import create_dag, create_bash_task

START_DATE = datetime(2019, 5, 6)
SCHEDULE_INTERVAL = '30 4 * * *'
DAG = create_dag(__file__, __doc__, START_DATE, SCHEDULE_INTERVAL)

BUILD_ARTERY_INTERSECTIONS = create_bash_task(DAG, 'build_artery_intersections')
BUILD_ARTERY_CENTRELINE = create_bash_task(DAG, 'build_artery_centreline')

BUILD_ARTERY_INTERSECTIONS >> BUILD_ARTERY_CENTRELINE
