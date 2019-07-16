"""
Pipeline for normalizing collision data
"""
from datetime import datetime
import os
from airflow import DAG
from airflow.operators.bash_operator import BashOperator

AIRFLOW_DAGS = os.path.dirname(os.path.realpath(__file__))
AIRFLOW_ROOT = os.path.dirname(AIRFLOW_DAGS)
AIRFLOW_TASKS = os.path.join(AIRFLOW_ROOT, 'tasks')

DEFAULT_ARGS = {
    'email': ['Chelsea.Rosic@toronto.ca'],
    'email_on_failure': True,
    'email_on_retry': True,
    'owner': 'ec2-user',
    'start_date': datetime(2019, 7, 9),
    'task_concurrency': 1
}

CRASH_NORM_DAG = DAG(
    'crash_norm',
    default_args=DEFAULT_ARGS,
    max_active_runs=1,
    schedule_interval='10 6-22 * * 1-5')

COPY_COLLISION_FACTORS_SH = os.path.join(AIRFLOW_TASKS, 'copy_collision_factors.sh')
COPY_COLLISION_FACTORS = BashOperator(
    task_id='copy_collision_factors',
    bash_command='{0} '.format(COPY_COLLISION_FACTORS_SH),
    dag=CRASH_NORM_DAG)

CRASH_NORM_SH = os.path.join(AIRFLOW_TASKS, 'crash_norm.sh')
CRASH_NORM = BashOperator(
    task_id='crash_norm',
    bash_command='{0} '.format(CRASH_NORM_SH),
    dag=CRASH_NORM_DAG)

CRASH_NORM.set_downstream(COPY_COLLISION_FACTORS)
