"""
gis_layers_vector_tiles

Generate vector tiles from GIS layers provided by GCC.  These are then
served from `/tiles` on our web tier, where they are used by `PaneMap`
in the web frontend to render school features at lower zoom levels.
"""
# pylint: disable=pointless-statement
from datetime import datetime

from airflow_utils import create_dag, create_bash_task

START_DATE = datetime(2019, 12, 11)
SCHEDULE_INTERVAL = '0 3 * * 6'
DAG = create_dag(__file__, __doc__, START_DATE, SCHEDULE_INTERVAL)

BUILD_GIS_LAYERS_TILES = create_bash_task(DAG, 'build_gis_layers_tiles')
EXTRACT_GIS_LAYERS_TILES = create_bash_task(DAG, 'extract_gis_layers_tiles')

BUILD_GIS_LAYERS_TILES >> EXTRACT_GIS_LAYERS_TILES
