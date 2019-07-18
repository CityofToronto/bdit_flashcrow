'''
Crash geocoding DAG
Match collisions to a centreline street segment or intersection
'''

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
    'start_date': datetime(2019, 7, 17),
    'task_concurrency': 1
}

CRASH_GEOCODING_DAG = DAG(
    'crash_geocoding',
    default_args=DEFAULT_ARGS,
    max_active_runs=1,
    schedule_interval='0 0 * * *')

CRASH_GEOCODING_SH = os.path.join(AIRFLOW_TASKS, 'crash_geocoding.sh')
CRASH_GEOCODING = BashOperator(
    task_id='crash_geocoding',
    bash_command='{0} '.format(CRASH_GEOCODING_SH),
    dag=CRASH_GEOCODING_DAG)
