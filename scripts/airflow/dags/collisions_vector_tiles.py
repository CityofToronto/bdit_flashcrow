"""
collisions_vector_tiles

Generate vector tiles from collisions data.  These are then
served from `/tiles` on our web tier, where they are used by `FcPaneMap`
in the web frontend to render collisions heatmaps at lower zoom levels.
"""
# pylint: disable=pointless-statement
from datetime import datetime

from airflow_utils import create_dag, create_bash_task

START_DATE = datetime(2019, 12, 8)
SCHEDULE_INTERVAL = '0 3 * * 6'
DAG = create_dag(__file__, __doc__, START_DATE, SCHEDULE_INTERVAL)

BUILD_COLLISIONS_TILES = create_bash_task(DAG, 'build_collisions_tiles')
EXTRACT_COLLISIONS_TILES = create_bash_task(DAG, 'extract_collisions_tiles')

BUILD_COLLISIONS_TILES >> EXTRACT_COLLISIONS_TILES
