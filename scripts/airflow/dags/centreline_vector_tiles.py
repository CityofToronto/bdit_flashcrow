from airflow import DAG
from airflow.operators.bash_operator import BashOperator
from datetime import datetime, timedelta
import os

AIRFLOW_DAGS = os.path.dirname(os.path.realpath(__file__))
AIRFLOW_ROOT = os.path.dirname(AIRFLOW_DAGS)
AIRFLOW_TASKS = os.path.join(AIRFLOW_ROOT, 'tasks')

default_args = {
    'email': ['Evan.Savage@toronto.ca'],
    'email_on_failure': True,
    'email_on_retry': True,
    'owner': 'ec2-user',
    'start_date': datetime(2019, 5, 5),
    'task_concurrency': 1
}

dag = DAG(
    'centreline_vector_tiles',
    default_args=default_args,
    max_active_runs=1,
    schedule_interval='0 4 * * 6')

copy_centreline_sh = os.path.join(AIRFLOW_TASKS, 'copy_centreline.sh')
copy_centreline = BashOperator(
    task_id='copy_centreline',
    bash_command='{0} '.format(copy_centreline_sh),
    dag=dag)

build_vector_tiles_sh = os.path.join(AIRFLOW_TASKS, 'build_vector_tiles.sh')
build_vector_tiles = BashOperator(
    task_id='build_vector_tiles',
    bash_command='{0} '.format(build_vector_tiles_sh),
    dag=dag)

extract_vector_tiles_sh = os.path.join(AIRFLOW_TASKS, 'extract_vector_tiles.sh')
extract_vector_tiles = BashOperator(
    task_id='extract_vector_tiles',
    bash_command='{0} '.format(extract_vector_tiles_sh),
    dag=dag)

copy_centreline >> build_vector_tiles
build_vector_tiles >> extract_vector_tiles
