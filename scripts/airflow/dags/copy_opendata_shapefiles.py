"""
copy_opendata_shapefiles

Copy important datasets in SHP format over to the RDS.
"""
# pylint: disable=pointless-statement
from datetime import datetime

from airflow.operators.bash_operator import BashOperator

from airflow_utils import create_bash_task_nested, create_dag

START_DATE = datetime(2020, 2, 27)
SCHEDULE_INTERVAL = '30 4 * * 6'
DAG = create_dag(__file__, __doc__, START_DATE, SCHEDULE_INTERVAL)

# The Open Data Portal (i.e. CKAN) uses these UUIDs to identify datasets.  To
# get the UUID for a dataset:
#
# - find the dataset in the Open Data Portal (for instance, the Toronto Centreline
#   is at https://open.toronto.ca/dataset/toronto-centreline-tcl/);
# - open the "For Developers" tab in the carousel;
# - the dataset UUID is listed in `params`.
TASKS = {
  'centreline': '1d079757-377b-4564-82df-eb5638583bfb',
  'centreline_intersection': '2c83f641-7808-49ba-b80f-7011851d4e27'
}

INDEX_OPENDATA = create_bash_task_nested(DAG, 'index_opendata')

for task_id, dataset_id in TASKS.items():
  task_id_extract = '{0}_extract'.format(task_id)
  EXTRACT_OPENDATA_SHAPEFILE = BashOperator(
    task_id=task_id_extract,
    bash_command='/copy_opendata_shapefiles/extract_opendata_shapefile.sh',
    params={
      'dataset_id': dataset_id,
      'name': task_id
    },
    dag=DAG
  )

  task_id_load = '{0}_load'.format(task_id)
  LOAD_SHAPEFILE = BashOperator(
    task_id=task_id_load,
    bash_command='/copy_opendata_shapefiles/load_shapefile.sh',
    params={
      'name': task_id
    },
    dag=DAG
  )

  EXTRACT_OPENDATA_SHAPEFILE >> LOAD_SHAPEFILE
  LOAD_SHAPEFILE >> INDEX_OPENDATA
