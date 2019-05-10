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
    'start_date': datetime(2019, 5, 8),
    'task_concurrency': 1
}

dag = DAG(
    'dev_data',
    default_args=default_args,
    max_active_runs=1,
    schedule_interval='30 5 * * 6')

sample_dev_data_sh = os.path.join(AIRFLOW_TASKS, 'sample_dev_data.sh')
sample_dev_data = BashOperator(
    task_id='sample_dev_data',
    bash_command='{0} '.format(sample_dev_data_sh),
    dag=dag)

dump_dev_data_sh = os.path.join(AIRFLOW_TASKS, 'dump_dev_data.sh')
dump_dev_data = BashOperator(
    task_id='dump_dev_data',
    bash_command='{0} '.format(dump_dev_data_sh),
    dag=dag)

sample_dev_data >> dump_dev_data
