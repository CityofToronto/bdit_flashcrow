"""
Pipeline for pulling traffic signal data
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

TRAFFIC_SIGNAL_DAG = DAG(
    'traffic_signals',
    default_args=DEFAULT_ARGS,
    max_active_runs=1,
    schedule_interval='10 6-22 * * 1-5')

PULL_TRAFFIC_SIGNALS_SH = os.path.join(AIRFLOW_TASKS, 'pull_traffic_signals.sh')
PULL_TRAFFIC_SIGNALS = BashOperator(
    task_id='pull_traffic_signals',
    bash_command='{0} '.format(PULL_TRAFFIC_SIGNALS_SH),
    dag=TRAFFIC_SIGNAL_DAG)
