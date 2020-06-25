"""
routing_index

Build any necessary views and indexes to support routing-related features in MOVE, such
as corridor interpolation for multi-location selection.
"""
# pylint: disable=pointless-statement
from datetime import datetime

from airflow_utils import create_dag, create_bash_task_nested

START_DATE = datetime(2020, 6, 23)
SCHEDULE_INTERVAL = '30 6 * * 6'
DAG = create_dag(__file__, __doc__, START_DATE, SCHEDULE_INTERVAL)

TRANSFORM_CENTRELINE_VERTICES = create_bash_task_nested(DAG, 'transform_centreline_vertices')
TRANSFORM_CENTRELINE_EDGES = create_bash_task_nested(DAG, 'transform_centreline_edges')

TRANSFORM_CENTRELINE_VERTICES >> TRANSFORM_CENTRELINE_EDGES
