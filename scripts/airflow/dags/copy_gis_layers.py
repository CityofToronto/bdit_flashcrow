"""
copy_gis_layers

Use `arcgis2pg` to copy important layers over to the RDS.
"""
# pylint: disable=pointless-statement
from datetime import datetime

from airflow.operators.bash_operator import BashOperator

from airflow_utils import create_dag

START_DATE = datetime(2019, 11, 13)
SCHEDULE_INTERVAL = '30 4 * * 6'
DAG = create_dag(__file__, __doc__, START_DATE, SCHEDULE_INTERVAL)

# GCC's ArcGIS REST API server exposes a series of "services", each with a name like
# `cot_geospatial2`.  Within those services, individual layers have an ID
# (in parentheses, after the layer name).
TASKS = {
  'bikeway': ('cot_geospatial2', 2),
  'accessible_signal': ('cot_geospatial2', 4),
  'pedestrian_crossover': ('cot_geospatial2', 7),
  'traffic_signal': ('cot_geospatial2', 9),
  'toinview_program_point': ('cot_geospatial12', 46),
  'toinview_program_line': ('cot_geospatial12', 47),
  'toinview_program_polygon': ('cot_geospatial12', 48),
  'school': ('cot_geospatial28', 17)
}

for task_id, task_args in TASKS.items():
  mapserver_name, layer_id = task_args
  params = {
    'mapserver_name': mapserver_name,
    'layer_id': layer_id
  }
  BashOperator(
    task_id=task_id,
    bash_command='/copy_gis_layer.sh',
    params=params,
    dag=DAG
  )
