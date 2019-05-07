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
    schedule_interval=timedelta(days=1))

copy_artery_tcl_sh = os.path.join(AIRFLOW_TASKS, 'copy_artery_tcl.sh')
copy_artery_tcl = BashOperator(
    task_id='copy_artery_tcl',
    bash_command='{0} '.format(copy_artery_tcl_sh),
    dag=dag)

