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
    'start_date': datetime(2019, 5, 6),
    'task_concurrency': 1
}

dag = DAG(
    'flow_geocoding',
    default_args=default_args,
    max_active_runs=1,
    schedule_interval='30 4 * * *')

copy_artery_tcl_sh = os.path.join(AIRFLOW_TASKS, 'copy_artery_tcl.sh')
copy_artery_tcl = BashOperator(
    task_id='copy_artery_tcl',
    bash_command='{0} '.format(copy_artery_tcl_sh),
    dag=dag)

build_artery_segments_sh = os.path.join(AIRFLOW_TASKS, 'build_artery_segments.sh')
build_artery_segments = BashOperator(
    task_id='build_artery_segments',
    bash_command='{0} '.format(build_artery_segments_sh),
    dag=dag)

build_artery_centreline_sh = os.path.join(AIRFLOW_TASKS, 'build_artery_centreline.sh')
build_artery_centreline = BashOperator(
    task_id='build_artery_centreline',
    bash_command='{0} '.format(build_artery_centreline_sh),
    dag=dag)

copy_artery_tcl >> build_artery_segments
build_artery_segments >> build_artery_centreline
