"""
centreline_vector_tiles

Generate vector tiles from City of Toronto centreline geometry.  These are then
served from `/tiles` on our web tier, where they are used by `FcPaneMap` in the web
frontend to render interactive centreline features.
"""
# pylint: disable=pointless-statement
from datetime import datetime

from airflow_utils import create_dag, create_bash_task

START_DATE = datetime(2019, 5, 5)
SCHEDULE_INTERVAL = '0 4 * * 6'
DAG = create_dag(__file__, __doc__, START_DATE, SCHEDULE_INTERVAL)

LOAD_VOLUME = create_bash_task(DAG, 'load_volume')
BUILD_VECTOR_TILES = create_bash_task(DAG, 'build_vector_tiles')
EXTRACT_VECTOR_TILES = create_bash_task(DAG, 'extract_vector_tiles')

LOAD_VOLUME >> BUILD_VECTOR_TILES
BUILD_VECTOR_TILES >> EXTRACT_VECTOR_TILES
